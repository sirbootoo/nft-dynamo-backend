const fs = require('fs');
const path = require('path');

const deleteFolderOnGeneration = async (sesID) => {
    // directory path
    const outputDir  = path.resolve(__dirname, `../../output/${sesID}`);
    const inputDir  = path.resolve(__dirname, `../../input/${sesID}`);
    

    // delete directory recursively
    try {
        fs.rmdirSync(outputDir, { recursive: true });
        fs.rmdirSync(inputDir, { recursive: true });

        console.log(`${outputDir} and ${inputDir} have been deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${outputDir}.`);
    }
}

module.exports = {
    deleteFolderOnGeneration
}

