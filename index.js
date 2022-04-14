const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const uploadDir = path.join(__dirname, '/input');
const extractDir = path.join(__dirname, '/inputs');
var cors = require('cors');
const filesController = require("./app/controllers/files");

const authMiddle = require("./app/middlewares/auth");


require("dotenv").config();


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("here");
        const { layer, rarity } = req.body
        const { sesid } = req.headers;
        const dir = `${uploadDir}/${ sesid }/${ layer }/${rarity}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        return cb(null, dir)
    }
});
// const multer_dest = () => {
//     console.log("multer dest =====> \n\n");
//     return multer({ storage }).single('file')
// };

const app = express();

app.use(cors());
app.use( express.json({limit: '50mb'}) );
app.use(express.urlencoded({
  limit: '200mb',
  extended: true,
  parameterLimit:200000
}));

app.locals.uploadDir = uploadDir;
app.locals.extractDir = extractDir;
app.locals.dirName = __dirname

app.get('/', [authMiddle.init], function (req, res) {
    res.sendFile(__dirname + '/app/views/index.html');
});
app.post('/upload', [authMiddle.verify, multer({ storage }).single('file')], filesController.upload);
app.get('/preview',[authMiddle.verify], filesController.preview);
app.post('/generate', [authMiddle.verify], filesController.generateNFTs);

app.listen((process.env.PORT || 3010), (err) => {
    if (err) throw err;
    console.log("NFT Dynamo API running...");
});