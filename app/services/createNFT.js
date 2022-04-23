const nftGenerator = require("../../builder");
const db = require("../helpers/db");
const files = require("../helpers/files")

let item = {
    title: "",
    description: "",
    metaDataURL: "",
    imagesURL: "",
    network: "",
    collectionSize: "",
    minted: "",
    downloaded: "",
    type: ""
}

let NFTDB = [];

const preview = async (sesID) => {
    try {
        console.log(sesID, "================ sesID ==============\n\n")
        const info = await nftGenerator({ sesID });
        console.log(info, "================== info =====================\n\n");
        return info;
    } catch (err) {
        console.log(err, "------------ Err --------------- \n\n");

    }
}

const generateNFTs = async (data) => {
    try {
        const info = await nftGenerator(data);
        const {imageFolderLink, metaFolderLink} = info;
        const dbObj = {
            sesID: data.sesID,
            title: data._name,
            description: data._description,
            metaFolderLink,
            imageFolderLink,
            network: "ETH",
            collectionSize: data._editionSize,
            type: data._type
        }
        await db.saveToMongoDB(dbObj);
        await files.deleteFolderOnGeneration(data.sesID);
        console.log("\n\nGeneration Done\n\n");
        return info;
    } catch (err) {
        Promise.reject(err);
    }
}

module.exports = {
    preview,
    generateNFTs
}