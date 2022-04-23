const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const schema = new Schema({
    action: {
        type: String
    },
    sesID: {
        type: String
    }
}, {
    timestamps: true,
});
schema.plugin(uniqueValidator);

const Model = mongoose.model("logs", schema);
module.exports = Model;