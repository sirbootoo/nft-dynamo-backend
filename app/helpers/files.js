const fs = require('fs');
const path = require('path');

const deleteFolderOnGeneration = async (sesID) => {
    // directory path
    const outputDir  = path.resolve(__dirname, `../../output/${sesID}`);
    

    // delete directory recursively
    try {
        fs.rmdirSync(outputDir, { recursive: true });

        console.log(`${outputDir} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${outputDir}.`);
    }
}

module.exports = {
    deleteFolderOnGeneration
}

