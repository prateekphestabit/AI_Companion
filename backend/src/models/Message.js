const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History", required: true },
        role: { 
            type: String, 
            enum: ["system", "user", "assistant", "agent"], 
            required: true 
        },
        content: { type: String, required: true },
    }, { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
