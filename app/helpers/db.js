const models = require("../models");

const saveToMongoDB = async (data) => {
    return models.session.create(data);
}


module.exports = {
    saveToMongoDB
}