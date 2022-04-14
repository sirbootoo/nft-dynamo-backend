const nftGenerator = require("../../builder");

const preview = async (sesID) => {
    try {
        console.log(sesID, "================ sesID ==============\n\n")
        const info = await nftGenerator({sesID});
        console.log(info, "================== info =====================\n\n");
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