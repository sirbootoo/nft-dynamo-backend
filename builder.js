// import dependencies
const console = require("console");
const dotenv = require("dotenv");
dotenv.config(); // setup dotenv

// utilise Moralis
const Moralis = require("moralis/node");

// canvas for image compile
const { createCanvas } = require("canvas");
require("dotenv").config();

// Moralis creds
const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;
const apiUrl = process.env.API_URL;
// xAPIKey available here: https://deep-index.moralis.io/api-docs/#/storage/uploadFolder
const apiKey = process.env.API_KEY;

// Start Moralis session
Moralis.start({ serverUrl, appId, masterKey });

// Create generative art by using the canvas api
const startCreating = async (data = {_editionSize: 10}) => {
  console.log(data, "<==================== Data inside \n\n");
  // import config
  const {
    layers,
    width,
    height,
    editionSize,
    startEditionFrom,
    rarityWeights
  } = require("./input/config.js")(data);
  
  // import metadata
  const { compileMetadata } = require("./src/metadata")(data);

  // import for saving files
  const { createFile } = require("./src/filesystem")(data);

  // setup canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  console.log("##################");
  console.log("# Generative Art #");
  console.log("# - Generating your NFT collection");
  console.log("##################");

  // image data collection
  let imageDataArray = [];

  // create NFTs from startEditionFrom to editionSize
  let editionCount = startEditionFrom;
  while (editionCount <= editionSize) {
    
    const handleFinal = async () => {
      // create image files and return object array of created images
      [...imageDataArray] = await createFile(
        canvas,
        ctx,
        layers,
        width,
        height,
        editionCount,
        editionSize,
        rarityWeights,
        imageDataArray,
        data.sesID
      );
    };

    await handleFinal();
    // iterate
    editionCount++;
  }

  const nftInfo = await compileMetadata(
    apiUrl,
    apiKey,
    editionCount,
    editionSize,
    imageDataArray,
    data.sesID
  );

  console.log();
  console.log("#########################################");
  console.log("Process Done");
  console.log("Generated", nftInfo?.imageInfo?.length, "images");
  console.log("#########################################");
  console.log();

  return nftInfo
};

// Initiate code
// startCreating();

module.exports = startCreating;
