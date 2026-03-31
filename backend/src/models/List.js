const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tasks: [
      {
        task: { type: String, required: true },
        state: { type: Boolean, default: false }
      },
    ],
  },
  { timestamps: true }
);

module.exports = listSchema;
