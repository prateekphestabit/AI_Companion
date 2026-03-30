const User = require('../models/User');
const logger = require('../utils/logger');
const bcrypt = require("bcryptjs");

// get user by id
async function getUserWithId(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password -avatar -companions.avatar');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        logger.error("Error in getUserWithId", req.params.id,  error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

// delete user by id
async function deleteUserWithId(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        logger.error("Error in deleteUserWithId", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

// get all users
async function getAllUsers(req, res) {
    try {
        const users = await User.find().select('-password -avatar -companions.avatar');
        res.status(200).json(users);
    } catch (error) {
        logger.error("Error in getAllUsers", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

// delete all users
async function deleteAllUser(req, res) {
    try {
        const result = await User.deleteMany({});
        res.status(200).json({
            success: true,
            message: "All users deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        logger.error("Error in deleteAllUser", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

async function createNewUser(req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      message: "user created Successfully"
    });
  } catch (error) {
    logger.error("Error in creating new user", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function uploadAvatar(req, res) {
    try {
        const { id } = req.body; 
        if (!id) {
            return res.status(400).json({ success: false, message: "User ID is required in body" });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.avatar = req.file.buffer; 
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Avatar uploaded successfully",
            avatarSize: user.avatar.length 
        });
    } catch (error) {
        logger.error("Error in uploadAvatar", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
} 

async function createNewCompanion(req, res) {
    try {
        const { userId, name, description, personality, communicationStyle, expertise } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required to create a companion" });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: "Companion name is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newCompanion = {
            name,
            description,
            personality,
            communicationStyle,
            expertise,
            avatar: req.file ? req.file.buffer : null
        };

        user.companions.push(newCompanion);
        await user.save();

        res.status(201).json({ 
            success: true, 
            message: "Companion created and added to user", 
            companion: user.companions[user.companions.length - 1] 
        });

    } catch (error) {
        logger.error("Error in createNewCompanion", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

async function deleteCompanion(req, res) {
    try {
        const { userId, companionId } = req.body;
        
        if (!userId || !companionId) {
            return res.status(400).json({ success: false, message: "userId and companionId are required" });
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
    getUserWithId,
    deleteUserWithId,
    getAllUsers,
    deleteAllUser,
    createNewUser,
    uploadAvatar,
    createNewCompanion,
    deleteCompanion
};
