const models = require("../models");

const saveToMongoDB = async (data) => {
    return models.session.create(data);
}

const getFromMongoDB = async (sesID) => {
    return models.session.findOne({
        sesID,
        type: "generate"
    });
}


module.exports = {
    saveToMongoDB,
    getFromMongoDB
}