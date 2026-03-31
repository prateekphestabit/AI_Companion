const logger = require('./../utils/logger.js');
const authRouter = require('../routes/auth.js');
const devRouter = require('../routes/dev.js');
const accountRouter = require('../routes/account.js');
const companionRouter = require('../routes/companion.js');
const chatRouter = require('../routes/chat.js');

class RoutesLoader {
    constructor() {
        this.routes = [
            { path: '/dev',  router: devRouter,  name: 'Dev Router' },
            { path: '/auth', router: authRouter, name: 'Auth Router' },
            { path: '/account', router: accountRouter, name: 'Account Router' },
            { path: '/companion', router: companionRouter, name: 'Companion Router' },
            { path: '/chat', router: chatRouter, name: 'Chat Router' }
        ];
    }

    async loadRoutes(app) {
        logger.info('Mounting Routes...');

        this.routes.forEach(({ path, router, name }) => {
            app.use(path, router);
            logger.info(`${name} mounted at: ${path}`);
        });

        logger.info('Routes Mounted... \n');
    }
}

module.exports = new RoutesLoader();