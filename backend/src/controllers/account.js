const User = require("../models/User");
const logger = require('../utils/logger.js');

async function deleteAccount(req, res){
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.clearCookie('token');
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    logger.error("Error in deleteAccount", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  deleteAccount
};
