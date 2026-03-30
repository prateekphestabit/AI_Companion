const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp({format: 'yyyy-MM-dd HH:mm:ss'}),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      level: 'info'
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      handleExceptions: true
    }),
    new winston.transports.Console({
      handleExceptions: true
    }),
  ],
});

module.exports = logger;