const models = require("../models");

const saveToMongoDB = async (data) => {
    return models.session.create(data);
}

const getFromMongoDB = async (sesID) => {
    return await models.session.findOne({
        sesID,
        type: "generate"
    });
}


module.exports = {
    saveToMongoDB,
    getFromMongoDB
}