const mongoose = require("mongoose");
const messageSchema = require("./Message");
  
const historySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    chatHistory: [messageSchema],
  },
  { timestamps: true }
);

module.exports = historySchema;
