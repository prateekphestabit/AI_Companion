const DBLoader = require("./db.js");
const MiddlewareLoader = require("./middleware.js");
const RoutesLoader = require("./routes.js");
const AppLoader = require("./app.js");
const logger = require('./../utils/logger.js');
const { connectMCP } = require('./mem0.js');

class Loader {
    async initializeApp(app, PORT, dbLink) {
        try {
            logger.info('Loading App... \n');
            await DBLoader.loadDatabase(dbLink);
            await MiddlewareLoader.loadMiddlewares(app);
            await RoutesLoader.loadRoutes(app);
            await connectMCP();
            await AppLoader.loadApp(app, PORT);
        } catch (error) {
            logger.error('Failed To Load', error);
        }
    }
}

module.exports = new Loader();