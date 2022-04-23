const fs = require("fs");
const uuid4 = require("uuid4");
const db = require("./db");


// Helper function
function base64_encode(file) {
    return "data:image/png;base64," + fs.readFileSync(file, 'base64');
}

const sessionGen = () => {
    // Generate a new UUID
    const id = uuid4();
    return id;
}

const getIPFSData = async (sesID) => {
    try {
        const payload = await db.getFromMongoDB(sesID);
        return payload;
    } catch(err) {
        Promise.reject(err);
    }
}


module.exports = {
    sessionGen,
    getIPFSData
}