const User = require("../models/User");
const Companion = require("../models/Companion");
const logger = require('../utils/logger.js');

async function deleteAccount(req, res){
  try {
    const userId = req.user._id;
    // findByIdAndDelete triggers User's pre('findOneAndDelete') cascade hook
    // which deletes all Companions → Histories → Messages
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

async function uploadAvatar(req, res) {
  try {
    const userId = req.user._id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.avatar = req.file.buffer;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully"
    });
  } catch (error) {
    logger.error("Error in uploadAvatar", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function getAccount(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userWithBase64 = {...user.toObject()};

    // Convert user avatar
    if (userWithBase64.avatar){
      let bufferData = null;
      if (Buffer.isBuffer(userWithBase64.avatar)) {
        bufferData = userWithBase64.avatar;
      } else if (userWithBase64.avatar.buffer) {
        bufferData = userWithBase64.avatar.buffer;
      }
      if (bufferData) {
        userWithBase64.avatar = `data:image/png;base64,${bufferData.toString('base64')}`;
      }
    }

    // Fetch companions separately (they are now in their own collection)
    const companions = await Companion.find({ userId });
    userWithBase64.companions = companions.map(comp => {
      const compData = { ...comp.toObject() };
      if (compData.avatar) {
        let bufferData = null;
        if (Buffer.isBuffer(compData.avatar)) {
          bufferData = compData.avatar;
        } else if (compData.avatar.buffer) {
          bufferData = compData.avatar.buffer;
        }

        if (bufferData) {
          compData.avatar = `data:image/png;base64,${bufferData.toString('base64')}`;
        }
      }
      return compData;
    });
    
    res.status(200).json({
      success: true,
      user: userWithBase64
    });
  } catch (error) {
    logger.error("Error in getAccount", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  deleteAccount,
  uploadAvatar,
  getAccount
};
