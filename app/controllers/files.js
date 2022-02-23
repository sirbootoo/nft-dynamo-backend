const uploadService = require("../services/upload");
const NFTService = require("../services/createNFT")

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
    try {
        const { sesid } = req.headers
        let payload = await NFTService.preview(sesID);
        let status = 200;
        if (!payload || (payload && payload.status === 0)) {
            res.statusCode = 400;
        }
        res.json(payload);
    } catch (err) {
        console.log("Error =============>", err, "<============ Error");
    }
}

const generateNFTs = async (req, res) => {
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
    _description = description.trim(),
    _editionSize = Number(editionSize),
    _layers = layers,
    _rarities = rarities, 
    { sesid } = req.headers;

    console.log("sesID = ", sesid);

    const data = {_width, _height, _description, _editionSize, _layers, _rarities, sesID: sesid};
    console.log("\n\n", data, "<=============== Inside controller \n\n");
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

module.exports = {
    upload,
    preview,
    generateNFTs
}