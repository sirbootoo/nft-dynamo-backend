const nftGenerator = require("../../builder");
const db = require("../helpers/db");
const files = require("../helpers/files");
const communications = require("../helpers/communications")

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
        const info = await nftGenerator({ sesID });
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
            type: data._type,
            assetsCount: data.assetsCount,
        }
        if(data._type === "generate"){
            await files.deleteFolderOnGeneration(data.sesID);
            await communications.sendElasticEmail(data.email, {
                collectionSize: data._editionSize,
                assetsCount: data.assetsCount,
                collectionURL: "https://app.nftdynamo.xyz/view?code="+ data.sesID
            });
        }
        await db.saveToMongoDB(dbObj);
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