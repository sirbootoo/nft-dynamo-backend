const uploadService = require("../services/upload");
const NFTService = require("../services/createNFT");
const models = require("../models");

const upload = (req, res) => {
    try {
        let payload = uploadService.upload(req);
        let status = 200;
        if (!payload || (payload && payload.status === 0)) {
            res.statusCode = 400;
        }
        res.json(payload);
    } catch (err) {
        console.log("Error =============>", err, "<============ Error");
    }
}

const preview = async (req, res) => {
    const {
        width,
        height,
        description,
        editionSize,
        layers,
        rarities,
        rarityPercentOptions } = req.body;

    let _width = Number(width),
        _height = Number(height),
        _editionSize = 1,
        _layers = layers,
        _rarities = rarities,
        { sesid } = req.headers,
        _description = `${sesid} preview`;

    console.log("sesID = ", sesid);

    const data = { 
        _width, 
        _height, 
        _description, 
        _editionSize, 
        _layers, 
        _rarities, 
        sesID: sesid, 
        _type: "preview" };
    try {
        let payload = await NFTService.generateNFTs(data);
        if (!payload || (payload && payload.status === 0)) {
            res.statusCode = 400;
        }
        res.json(payload);
    } catch (err) {
        res.statusCode = 500;
        res.json({
            status: 0,
            message: "Something went wrong",
            err: err.message
        });
        console.log("Error =============>", err, "<============ Error");
    }
}

const generateNFTs = async (req, res) => {
    const {
        name,
        width,
        height,
        description,
        editionSize,
        layers,
        rarities,
        rarityPercentOptions } = req.body;

    let _width = Number(width),
        _height = Number(height),
        _description = description.trim(),
        _editionSize = Number(editionSize),
        _layers = layers,
        _rarities = rarities,
        _name = name,
        { sesid } = req.headers;

    console.log("sesID = ", sesid);

    const data = { 
        _width, 
        _height, 
        _description, 
        _name, 
        _editionSize, 
        _layers, 
        _rarities, 
        sesID: sesid, 
        _type: "generate" 
    };
    try {
        let payload = await NFTService.generateNFTs(data);
        if (!payload || (payload && payload.status === 0)) {
            res.statusCode = 400;
        }
        res.json(payload);
    } catch (err) {
        res.statusCode = 500;
        res.json({
            status: 0,
            message: "Something went wrong",
            err: err.message
        });
        console.log("Error =============>", err, "<============ Error");
    }

}


const getNFTInfoFromDB = async () => { }

module.exports = {
    upload,
    preview,
    generateNFTs
}