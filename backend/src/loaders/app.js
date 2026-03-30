const logger = require('./../utils/logger.js');

class AppLoader {
    async loadApp(app, PORT) {
        app.listen(PORT, () => {
            logger.info(`Server is running at http://localhost:${PORT}`);
        });
    }
}

module.exports = new AppLoader();