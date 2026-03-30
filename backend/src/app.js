require('dotenv').config();
const Loader = require('./loaders/loader.js');

const express = require('express');
const app = express();

Loader.initializeApp(app, process.env.PORT, process.env.MONGODB_URI);
