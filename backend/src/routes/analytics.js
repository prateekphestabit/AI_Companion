const analyticsRouter = require("express").Router();
const { getAnalytics } = require("../controllers/analytics.js");

analyticsRouter.route("/").get(getAnalytics);

module.exports = analyticsRouter;

// base route /analytics
