const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const multer = require("multer");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");


const uploadDir = path.join(__dirname, '/input');
const extractDir = path.join(__dirname, '/inputs');
var cors = require('cors');
const filesController = require("./app/controllers/files");

const authMiddle = require("./app/middlewares/auth");


require("dotenv").config();

console.log("Server environment = " + process.env.NODE_ENV);

main().then(res => {
    console.log("DB Server connected.")
}).catch(err => console.log(err));

async function main() {
    if(process.env.NODE_ENV === "production") {
        await mongoose.connect(process.env.MONGO_DB_URL);
    } else {
        await mongoose.connect('mongodb://localhost:27017/test');
    }
}


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { layer, rarity } = req.body
        const { sesid } = req.headers;
        const dir = `${uploadDir}/${sesid}/${layer}/${rarity}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return cb(null, dir)
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "_" + file.originalname);
    }
});
// const multer_dest = () => {
//     console.log("multer dest =====> \n\n");
//     return multer({ storage }).single('file')
// };

const app = express();

Sentry.init({
    dsn: "https://bd83dbc31f6341e5b2e15ea6f9427528@o245931.ingest.sentry.io/6358051",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    limit: '200mb',
    extended: true,
    parameterLimit: 200000
}));

app.locals.uploadDir = uploadDir;
app.locals.extractDir = extractDir;
app.locals.dirName = __dirname

app.get('/', [authMiddle.init], function (req, res) {
    res.sendFile(__dirname + '/app/views/index.html');
});
app.post('/upload', [authMiddle.verify, multer({ storage }).single('file')], filesController.upload);
app.get('/view', [authMiddle.verify], filesController.view);
app.post('/preview', [authMiddle.verify], filesController.previewController);
app.post('/generate', [authMiddle.verify], filesController.generateNFTs);

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.listen((process.env.PORT || 3010), (err) => {
    if (err) throw err;
    console.log("NFT Dynamo API running...");
});