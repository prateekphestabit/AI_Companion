const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    chatHistory: [
      {
        role: { 
          type: String, 
          enum: ["system", "user", "assistant", "agent"], 
          required: true 
        },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = historySchema;
