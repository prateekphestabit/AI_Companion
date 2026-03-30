const User = require("../models/User");
const logger = require("../utils/logger");

async function getAllCompanions(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("companions");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
        success: true, 
        companions: user.companions 
    });
  } catch (error) {
    logger.error("Error in getAllCompanions", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function createCompanion(req, res) {
    try {
        const { name, description, personality, communicationStyle, expertise } = req.body;
        const userId = req.user._id;

        if (!name) {
            return res.status(400).json({ success: false, message: "Companion name is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newCompanion = {
            name,
            description: description || "",
            personality,
            communicationStyle,
            expertise,
            avatar: req.file ? req.file.buffer : null
        };

        user.companions.push(newCompanion);
        await user.save();

        res.status(201).json({
            success: true,
            message: "Companion created successfully",
            companion: user.companions[user.companions.length - 1]
        });

    } catch (error) {
        logger.error("Error in createCompanion", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

async function deleteCompanion(req, res) {
    try {
        const { companionId } = req.body;
        const userId = req.user._id;

        if (!companionId) {
            return res.status(400).json({ success: false, message: "companionId is required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { companions: { _id: companionId } } },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Companion deleted successfully" });

    } catch (error) {
        logger.error("Error in deleteCompanion", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

module.exports = {
  getAllCompanions,
  createCompanion,
  deleteCompanion
};
