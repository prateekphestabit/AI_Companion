const User = require("../models/User");
const Companion = require("../models/Companion");
const logger = require("../utils/logger");

async function getAllCompanions(req, res) {
    try {
        const userId = req.user._id;

        const companions = await Companion.find({ userId });

        const companionsWithBase64 = companions.map(comp => {
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
            companions: companionsWithBase64
        });
    } catch (error) {
        logger.error("Error in getAllCompanions", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

async function createCompanion(req, res) {
    try {
        const { name, description, personality, communicationStyle, expertise, systemPrompt } = req.body;
        const userId = req.user._id;

        if (!name) {
            return res.status(400).json({ success: false, message: "Companion name is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const finalSystemPrompt = systemPrompt || `Your name is ${name}, 
you have a ${personality} personality,
your communication style should be ${communicationStyle},
and you are an expert in ${expertise}.
always give answers in this tone and personaity.

If you think of creating notes or list, always ask user for permission before creating any list or note.

user's name is ${user.name}.`;

        const companion = await Companion.create({
            userId,
            name,
            description: description || "",
            personality,
            communicationStyle,
            expertise,
            systemPrompt: finalSystemPrompt,
            avatar: req.file ? req.file.buffer : null
        });

        // Push companion ID into user's companions array
        user.companions.push(companion._id);
        await user.save();

        const createdCompanion = { ...companion.toObject() };
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

        const companion = await Companion.findOne({ _id: companionId, userId });
        if (!companion) {
            return res.status(404).json({ success: false, message: "Companion not found" });
        }

        // deleteOne triggers cascade hook (deletes Histories → Messages)
        await companion.deleteOne();

        // Pull companion ID from user's companions array
        await User.findByIdAndUpdate(userId, { $pull: { companions: companionId } });

        res.status(200).json({ success: true, message: "Companion deleted successfully" });

    } catch (error) {
        logger.error("Error in deleteCompanion", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

async function editCompanion(req, res) {
    try {
        const { companionId, name, description, personality, communicationStyle, expertise, systemPrompt } = req.body;
        const userId = req.user._id;

        if (!companionId || !name) {
            return res.status(400).json({ success: false, message: "companionId and name are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const companion = await Companion.findOne({ _id: companionId, userId });
        if (!companion) {
            return res.status(404).json({ success: false, message: "Companion not found" });
        }

        const finalSystemPrompt = systemPrompt || `Your name is ${name}, 
you have a ${personality} personality,
your communication style should be ${communicationStyle},
and you are an expert in ${expertise}.
always give answers in this tone and personaity.

If you think of creating notes or list, always ask user for permission before creating any list or note.

user's name is ${user.name}.`;

        companion.name = name;
        companion.description = description || "";
        companion.personality = personality;
        companion.communicationStyle = communicationStyle;
        companion.expertise = expertise;
        companion.systemPrompt = finalSystemPrompt;

        if (req.file) {
            companion.avatar = req.file.buffer;
        } else if (req.body.removeAvatar === 'true') {
            companion.avatar = undefined;
        }

        await companion.save();
        
        let editedCompanion = { ...companion.toObject() };
        if (editedCompanion.avatar) {
            let bufferData = null;
            if (Buffer.isBuffer(editedCompanion.avatar)) {
                bufferData = editedCompanion.avatar;
            } else if (editedCompanion.avatar.buffer) { 
                bufferData = editedCompanion.avatar.buffer;
            }

            if (bufferData) {
                editedCompanion.avatar = `data:image/png;base64,${bufferData.toString('base64')}`;
            }
        }

        res.status(200).json({ success: true, message: "Companion updated successfully", companion: editedCompanion });
    } catch (error) {
        logger.error("Error in editCompanion", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

async function duplicateCompanion(req, res) {
    try {
        const { companionId, name, description, personality, communicationStyle, expertise, systemPrompt } = req.body;
        const userId = req.user._id;

        if (!companionId || !name) {
            return res.status(400).json({ success: false, message: "companionId and name are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const existingCompanion = await Companion.findOne({ _id: companionId, userId });
        if (!existingCompanion) {
            return res.status(404).json({ success: false, message: "Companion to duplicate not found" });
        }

        const finalSystemPrompt = systemPrompt || `Your name is ${name}, 
you have a ${personality} personality,
your communication style should be ${communicationStyle},
and you are an expert in ${expertise}.
always give answers in this tone and personaity.

If you think of creating notes or list, always ask user for permission before creating any list or note.

user's name is ${user.name}.`;

        const newCompanion = await Companion.create({
            userId,
            name,
            description: description || "",
            personality,
            communicationStyle,
            expertise,
            systemPrompt: finalSystemPrompt,
            avatar: req.file ? req.file.buffer : (req.body.removeAvatar === 'true' ? undefined : existingCompanion.avatar)
        });

        // Push new companion ID into user's companions array
        user.companions.push(newCompanion._id);
        await user.save();

        const createdCompanion = { ...newCompanion.toObject() };
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

        res.status(201).json({ success: true, message: "Companion duplicated successfully", companion: createdCompanion });
    } catch (error) {
        logger.error("Error in duplicateCompanion", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

module.exports = {
    getAllCompanions,
    createCompanion,
    deleteCompanion,
    editCompanion,
    duplicateCompanion
};
