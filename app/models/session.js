const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        title: {
            type: String,
            required: 'Title is required'
        },
        description: {
            type: String,
            required: 'Description is required'
        },
        metaFolderLink: {
            type: String,
            allowNull: true
        },
        imageFolderLink: {
            type: String,
            allowNull: true
        },
        sesID: {
            type: String,
            allowNull: false
        },
        network: {
            type: String,
            allowNull: true
        },
        collectionSize: {
            type: Number,
            allowNull: true
        },
        assetsCount: {
            type: Number,
            allowNull: true
        },
        minted: {
            type: Boolean,
            default: false
        },
        downloaded: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: ["preview", "generate"],
            default: "generate"
        },
    },
    {
        timestamps: true,
    }
);
schema.plugin(uniqueValidator);

const Model = mongoose.model("sessions", schema);
module.exports = Model;
