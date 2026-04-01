const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        role: { 
            type: String, 
            enum: ["system", "user", "assistant", "agent"], 
            required: true 
        },
        content: { type: String, required: true },
    }, { timestamps: true }
);

module.exports = messageSchema;
