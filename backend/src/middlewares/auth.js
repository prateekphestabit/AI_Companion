const logger = require('../utils/logger.js');
const jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");

async function authMiddleware(req, res, next){
  if (req.path.startsWith('/dev') || req.path.startsWith('/auth')) {
    return next();
  }

  try {
    const token = req.cookies.token; 
    if (!token) {
      return res.status(401).json({ success: false, message: "No JWT token found" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error("JWT token was Invalid", error);
      res.clearCookie('token'); 
      return res.status(401).json({ success: false, message: "Invalid JWT token" });
    } 
    
    req.user = decodedToken;
    next();

  } catch (error) {
    logger.error("Error in auth", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 6, 
  message: { success: false, message: "Too many sign-in attempts from this IP, please try again after 15 minutes." },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = {authMiddleware, signinLimiter};      