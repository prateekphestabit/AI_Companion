const mongoose = require("mongoose");
const companionSchema = require("./Companion");
const listSchema = require("./List");
const noteSchema = require("./Note");

const userSchema = new mongoose.Schema(
  { 
    name:     { type: String, required: true, trim: true},
    email:    { type: String, required: true, trim: true, unique:true, lowercase: true},
    password: { type: String, required: true},
    avatar:   { type: Buffer, default: null },
    companions: [companionSchema],
    lists: [listSchema],
    notes: [noteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
