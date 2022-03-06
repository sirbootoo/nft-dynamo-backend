const fs = require("fs");
const Moralis = require("moralis/node");
const { default: axios } = require("axios");


const runMetaDataFile = (data) => {

  const { saveToDb } = require("./filesystem")(data);

  const { description, baseImageUri } = require("../input/config.js")(data);
  // write metadata locally to json files
  const writeMetaData = metadataList => {
    fs.writeFileSync("./output/_metadata.json", JSON.stringify(metadataList));
  };

  // add metadata for individual nft edition
  const generateMetadata = (dna, edition, attributesList, path) => {
    let dateTime = Date.now();
    let tempMetadata = {
      dna: dna.join(""),
      name: `#${edition}`,
      description: description,
      image: path || baseImageUri,
      edition: edition,
      date: dateTime,
      attributes: attributesList
    };
    return tempMetadata;
  };

  // upload metadata
  const uploadMetadata = async (
    apiUrl,
    xAPIKey,
    imageCID,
    editionSize,
    imageDataArray
  ) => {  
    const ipfsArray = []; // holds all IPFS data
    const metadataList = []; // holds metadata for all NFTs (could be a session store of data)
    const promiseArray = []; // array of promises so that only if finished, will next promise be initiated
    for (let i = 1; i < editionSize + 1; i++) {
      let id = i.toString();
      let paddedHex = (
        "0000000000000000000000000000000000000000000000000000000000000000" + id
      ).slice(-64);
      let filename = i.toString() + ".json";

      let filetype = "base64";
      imageDataArray[
        i
      ].filePath = `https://ipfs.moralis.io:2053/ipfs/${imageCID}/images/${paddedHex}.png`;
      //imageDataArray[i].image_file = res.data[i].content;

      // do something else here after firstFunction completes
      let nftMetadata = generateMetadata(
        imageDataArray[i].newDna,
        imageDataArray[i].editionCount,
        imageDataArray[i].attributesList,
        imageDataArray[i].filePath
      );
      metadataList.push(nftMetadata);
      try {
        // upload metafile data to Moralis
        const metaFile = new Moralis.File(filename, {
          base64: Buffer.from(
            JSON.stringify(metadataList.find(meta => meta.edition == i))
          ).toString("base64")
        });
      } catch (err) { }

      // save locally as file
      fs.writeFileSync(
        `./output/${filename}`,
        JSON.stringify(metadataList.find(meta => meta.edition == i))
      );

      // reads output folder for json files and then adds to IPFS object array
      promiseArray.push(
        new Promise((res, rej) => {
          fs.readFile(`./output/${id}.json`, (err, data) => {
            if (err) rej();
            ipfsArray.push({
              path: `metadata/${paddedHex}.json`,
              content: data.toString("base64")
            });
            res();
          });
        })
      );
    }

    // once all promises back then save to IPFS and Moralis database
    return Promise.all(promiseArray).then(() => {
      return axios
        .post(apiUrl, ipfsArray, {
          headers: {
            "X-API-Key": xAPIKey,
            "content-type": "application/json",
            accept: "application/json"
          }
        })
        .then(res => {
          const metaCID = res.data[0].path.split("/")[4];
          const metaFolderLink = res.data[0].path.split("00000000")[0];
          saveToDb(metaCID, imageCID, editionSize);
          writeMetaData(metadataList);
          return {metaInfo: res.data, metaCID, metaFolderLink};
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

  // compile metadata (reads output folder images)
  const compileMetadata = async (
    apiUrl,
    xAPIKey,
    editionCount,
    editionSize,
    imageDataArray
  ) => {
    ipfsArray = [];
    promiseArray = [];

    for (let i = 1; i < editionCount; i++) {
      let id = i.toString();
      let paddedHex = (
        "0000000000000000000000000000000000000000000000000000000000000000" + id
      ).slice(-64);
      // reads output folder for images and adds to IPFS object metadata array (within promise array)
      promiseArray.push(
        new Promise((res, rej) => {
          fs.readFile(`./output/${id}.png`, (err, data) => {
            if (err) rej();
            ipfsArray.push({
              path: `images/${paddedHex}.png`,
              content: data.toString("base64")
            });
            res();
          });
        })
      );
    }

    // once all promises then upload IPFS object metadata array
    return Promise.all(promiseArray).then(() => {
      return axios
        .post(apiUrl, ipfsArray, {
          headers: {
            "X-API-Key": xAPIKey,
            "content-type": "application/json",
            accept: "application/json"
          }
        })
        .then(async res => {
          const imageCID = res.data[0].path.split("/")[4];
          const imageFolderLink = res.data[0].path.split("00000000")[0];
          // pass folder CID to meta data
          const {metaInfo, metaCID, metaFolderLink} = await uploadMetadata(apiUrl, xAPIKey, imageCID, editionSize, imageDataArray);
          return {imageCID, metaCID, imageFolderLink, metaFolderLink, imageInfo: res.data, metaInfo}
        })
        .catch(err => {
          console.log(err, "\n\n===============================");
        });
    });
  };
  return {
    generateMetadata,
    writeMetaData,
    uploadMetadata,
    compileMetadata
  };
}

module.exports = runMetaDataFile;
