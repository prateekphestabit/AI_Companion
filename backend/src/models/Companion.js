const mongoose = require("mongoose");
const historySchema = require("./History");

const companionSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true }, 
    avatar:             { type: Buffer, default: null },
    description:        { type: String, trim: true },
    personality:        { type: String, trim: true },
    communicationStyle: { type: String, trim: true },
    expertise:          { type: String, trim: true },
    systemPrompt:       { type: String, trim: true },
    history:            [historySchema],
  },
  { timestamps: true }
);

module.exports = companionSchema;
