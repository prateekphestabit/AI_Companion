const User = require("../models/User");
const logger = require("../utils/logger");

async function getAllCompanions(req, res) {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("companions");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const companionsWithBase64 = user.companions.map(comp => {
            const compData = { ...comp.toObject() };
            // Mongoose stores buffers as BSON Binary objects or native Buffers depending on the driver version
            if (compData.avatar) {
                let bufferData = null;
                if (Buffer.isBuffer(compData.avatar)) {
                    bufferData = compData.avatar;
                } else if (compData.avatar.buffer) { // Handle BSON Binary
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
            companions: companionsWithBase64
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

        const systemPrompt = `Your name is ${name}, 
        you have a ${personality} personality,
        your communication style should be ${communicationStyle},
        and you are an expert in ${expertise}.
        always give answers in this tone and personaity.

        If you think of creating notes or list,always ask user for
        permission before creating any list or note.`;

        const newCompanion = {
            name,
            description: description || "",
            personality,
            communicationStyle,
            expertise,
            systemPrompt: systemPrompt,
            avatar: req.file ? req.file.buffer : null
        };
        
        user.companions.push(newCompanion);
        
        await user.save();
        
        const createdCompanion = { ...user.companions[user.companions.length - 1].toObject() };
        if (createdCompanion.avatar) {
            let bufferData = null;
            if (Buffer.isBuffer(createdCompanion.avatar)) {
                bufferData = createdCompanion.avatar;
            } else if (createdCompanion.avatar.buffer) { 
                bufferData = createdCompanion.avatar.buffer;
            }

            if (bufferData) {
                createdCompanion.avatar = `data:image/png;base64,${bufferData.toString('base64')}`;
            }
        }

        res.status(201).json({
            success: true,
            message: "Companion created successfully",
            companion: createdCompanion
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
