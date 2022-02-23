const prev = require("../helpers/preview");
const uuid4 = require("uuid4");


const init = (req, res, next) => {
    const { sesID } = req.headers;
    if(!sesID) {
        // Generate a new UUID
        const id = uuid4();
        res.set('sesID', id);
        res.set('Access-Control-Expose-Headers', '*')
        return next();
    } 
    if(!uuid4.valid(sesID)) {
        res.statusCode = 401;
        return res.json("Trying to be funny, right?");
    } else {
        return next();
    }
}

const verify = (req, res, next) => {
    const { sesid } = req.headers;
    if(!sesid) {
        res.statusCode = 401;
        return res.json("There's something fishy about your request.");
    } 
    if(!uuid4.valid(sesid)) {
        res.statusCode = 401;
        return res.json("Trying to be funny, right?");
    }
    console.log(sesid, req.headers, "<================= sesid");
    return next();
}

module.exports = {
    init, verify
}