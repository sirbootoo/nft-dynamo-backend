const nftGenerator = require("../../index");

const preview = async (sesID) => {
    try {
        const info = await nftGenerator({sesID});
        return info;
    } catch(err) {}
}

const generateNFTs = async (data) => {
    try {
        const info = await nftGenerator(data);
        return info;
    } catch(err) {
        Promise.reject(err);
    }
}

module.exports = {
    preview,
    generateNFTs
}