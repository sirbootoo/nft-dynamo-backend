/*******************************************************************
 * UTILITY FUNCTIONS
 * - scroll to BEGIN COLLECTION CONFIG to provide the config values
 ******************************************************************/
const fs = require("fs");
const dir = __dirname;
let RarityWeights = [];
// prefix to add to edition dna ids (to distinguish dna counts from different generation processes for the same collection)
const editionDnaPrefix = 0;
// image width in pixels
let width = 1000;
// image height in pixels
let height = 1000;
// description for NFT in metadata file
let description = "A great art";
// base url in case no unique metadata file i.e IPFS
let baseImageUri = "YOUR_MORALIS_SERVER_URL";
// id for edition to start from
let startEditionFrom = 1;
// amount of NFTs to generate in edition
let editionSize = 10;

// adds a rarity to the configuration. This is expected to correspond with a directory containing the rarity for each defined layer
// @param _id - id of the rarity
// @param _from - number in the edition to start this rarity from
// @param _to - number in the edition to generate this rarity to
// @return a rarity object used to dynamically generate the NFTs
const addRarity = (_id, _from, _to) => {
  const _rarityWeight = {
    value: _id,
    from: _from,
    to: _to,
    layerPercent: {},
  };
  return _rarityWeight;
};

// get the name without last 4 characters -> slice .png from the name
const cleanName = (_str) => {
  let name = _str.slice(0, -4);
  return name;
};

// reads the filenames of a given folder and returns it with its name and path
const getElements = (_path, _elementCount) => {
  return fs
    .readdirSync(_path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i) => {
      return {
        id: _elementCount,
        name: cleanName(i),
        path: `${_path}/${i}`,
      };
    });
};

// adds a layer to the configuration. The layer will hold information on all the defined parts and
// where they should be rendered in the image
// @param _id - id of the layer
// @param _position - on which x/y value to render this part
// @param _size - of the image
// @return a layer object used to dynamically generate the NFTs
const addLayer = (_id, _position, _size, sesID=null) => {
  if (!_id) {
    console.log("error adding layer, parameters id required");
    return null;
  }
  if (!_position) {
    _position = { x: 0, y: 0 };
  }
  if (!_size) {
    _size = { width: width, height: height };
  }
  // add two different dimension for elements:
  // - all elements with their path information
  // - only the ids mapped to their rarity
  let elements = [];
  let elementCount = 0;
  let elementIdsForRarity = {};
  RarityWeights.forEach((rarityWeight) => {
    let dirLoc = "";
    if(sesID){
      dirLoc =  `${dir}/${sesID}/${_id}/${rarityWeight.value}`;
    }else {
      dirLoc =  `${dir}/${_id}/${rarityWeight.value}`;
    }
    let elementsForRarity = getElements(dirLoc);

    elementIdsForRarity[rarityWeight.value] = [];
    elementsForRarity.forEach((_elementForRarity) => {
      _elementForRarity.id = `${editionDnaPrefix}${elementCount}`;
      elements.push(_elementForRarity);
      elementIdsForRarity[rarityWeight.value].push(_elementForRarity.id);
      elementCount++;
    });
    elements[rarityWeight.value] = elementsForRarity;
  });

  let elementsForLayer = {
    id: _id,
    position: _position,
    size: _size,
    elements,
    elementIdsForRarity,
  };
  return elementsForLayer;
};

// adds layer-specific percentages to use one vs another rarity
// @param _rarityId - the id of the rarity to specifiy
// @param _layerId - the id of the layer to specifiy
// @param _percentages - an object defining the rarities and the percentage with which a given rarity for this layer should be used
const addRarityPercentForLayer = (_rarityId, _layerId, _percentages) => {
  let _rarityFound = false;
  RarityWeights.forEach((_rarityWeight) => {
    if (_rarityWeight.value === _rarityId) {
      let _percentArray = [];
      for (let percentType in _percentages) {
        _percentArray.push({
          id: percentType,
          percent: _percentages[percentType],
        });
      }
      _rarityWeight.layerPercent[_layerId] = _percentArray;
      _rarityFound = true;
    }
  });
  if (!_rarityFound) {
    console.log(
      `rarity ${_rarityId} not found, failed to add percentage information`
    );
  }
};

/*************************************************************
 * DYNAMICALLY ADD LAYERS
 *************************************************************/
const addingDynamicLayers = ({layers, width, height, sesID}) => {
  console.log(sesID, "<===================== ses ID \n\n")
  return layers.map((x, index) => {
    if (index === 0) {
      return addLayer(x, { x: 0, y: 0 }, { width: width, height: height }, sesID);
    } else {
      return addLayer(x, null, null, sesID);
    }
  });
}

/*************************************************************
 * DYNAMICALLY ADD RARITY
 *************************************************************/
 const addingDynamicRarity = ({_rarities, _from, _to}) => {
  return _rarities.map((i) => {
    return addRarity(i, _from, _to);
  });
}

/**************************************************************
 * BEGIN COLLECTION CONFIG
 *************************************************************/
const configInit = ({_width, _height, _description, _editionSize, _layers, _rarities, _rarityPercentOptions, sesID}) => {
  // image width in pixels
  width = _width || width;
  // image height in pixels
  height = _height || height;
  // description for NFT in metadata file
  description = _description || description;
  // base url in case no unique metadata file i.e IPFS
  baseImageUri = "YOUR_MORALIS_SERVER_URL";
  // amount of NFTs to generate in edition
  editionSize = _editionSize || editionSize;
  // create required weights
  // for each weight, call 'addRarity' with the id and from which to which element this rarity should be applied
  let rarityWeights = (_rarities && _rarities.length > 0) ? addingDynamicRarity({_rarities, _from:1, _to:editionSize}) : [
    /* 
    addRarity("rare", 1, 1),
    */
    addRarity("original", 1, editionSize),
  ];
  RarityWeights = rarityWeights;
  // create required layers
  // for each layer, call 'addLayer' with the id and optionally the positioning and size
  // the id would be the name of the folder in your input directory, e.g. 'ball' for ./input/ball

  const layers = (_layers && _layers.length > 0) ? addingDynamicLayers({layers: _layers, width, height, sesID}) : [
    addLayer("Background", { x: 0, y: 0 }, { width: width, height: height }),
    addLayer("Base Torso"),
    addLayer("Base Head"),
    addLayer("Torso"),
    addLayer("Arms"),
    addLayer("Mouths"),
    addLayer("Eyes"),
    addLayer("Accessories"),
    addLayer("Noses"),
  ];

  // provide any specific percentages that are required for a given layer and rarity level
  // all provided options are used based on their percentage values to decide which layer to select from
  addRarityPercentForLayer("original", "Eyes", {
    super_rare: 0,
    rare: 0,
    original: 100,
  });

  return {
    layers,
    width,
    height,
    description,
    baseImageUri,
    editionSize,
    startEditionFrom,
    rarityWeights,
  }
}

module.exports = configInit;
