const mongoose = require("mongoose");
const logger = require('./../utils/logger.js');

async function connectMongoose(path){
    try {
        await mongoose.connect(path)
        logger.info("MongoDB connected \n");
    } catch (error) {
        logger.error("MongoDB connection error:", error);
        logger.on('finish', () => {
            process.exit(1);
        });
    }
}

module.exports = connectMongoose;