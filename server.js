const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const uploadDir = path.join(__dirname, '/input');
const extractDir = path.join(__dirname, '/inputs');
var cors = require('cors');

const filesController = require("./app/controllers/files");

const authMiddle = require("./app/middlewares/auth");


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

const server = express();

server.use(cors())
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

server.locals.uploadDir = uploadDir;
server.locals.extractDir = extractDir;
server.locals.dirName = __dirname

server.get('/', [authMiddle.init], function (req, res) {
    res.sendFile(__dirname + '/app/views/index.html');
});
server.post('/upload', [authMiddle.verify, multer({ storage }).single('file')], filesController.upload);
server.get('/preview',[authMiddle.verify], filesController.preview);
server.post('/generate', [authMiddle.verify], filesController.generateNFTs);

server.listen(3000, (err) => {
    if (err) throw err;
    console.log("NFT Dynamo API running...");
});