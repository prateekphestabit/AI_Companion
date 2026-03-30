const connectMongoose = require("../config/DBconnection.js");

class DBLoader {
    async loadDatabase(link) {
        await connectMongoose(link);
    }
}

module.exports = new DBLoader();