const testRouter = require('express').Router();
const axios = require("axios");
const logger = require('./../utils/logger.js');

testRouter.get("/", async (req, res) => {
    const { data } = await axios.get("http://localhost:8000/chat", {
        params: { message: "node js" }
    });
    res.json(data);
});

module.exports = testRouter;