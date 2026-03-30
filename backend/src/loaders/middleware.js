const logger = require('./../utils/logger.js');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authMiddleware = require('../middlewares/auth.js');

class MiddlewareLoader {
    async loadMiddlewares(app) {
        logger.info('Loading Middlewares...');
        
        app.use(cors({
            origin: 'http://localhost:5174', 
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cookieParser());
        app.use(authMiddleware);

        logger.info('All Middlewares Loaded...\n');
    }
}

module.exports = new MiddlewareLoader();