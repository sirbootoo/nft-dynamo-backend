const uploadHelper = require("../helpers/upload");


const upload = (req) => {
    return uploadHelper.uploadMedia(req);
}


module.exports = {
    upload
}