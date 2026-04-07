const mongoose = require("mongoose");
const listSchema = require("./List");
const noteSchema = require("./Note");

const userSchema = new mongoose.Schema(
  { 
    name:     { type: String, required: true, trim: true},
    email:    { type: String, required: true, trim: true, unique:true, lowercase: true},
    password: { type: String, required: true},
    avatar:   { type: Buffer, default: null },
    companions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Companion" }],
    lists: [listSchema],
    notes: [noteSchema],
  },
  { timestamps: true }
);

// Cascade delete: when a User is deleted via findByIdAndDelete / findOneAndDelete,
// remove all their Companions (which cascade to Histories → Messages)
userSchema.pre('findOneAndDelete', async function () {
  const Companion = mongoose.model("Companion");
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    const companions = await Companion.find({ userId: doc._id });
    for (const companion of companions) {
      await companion.deleteOne(); // triggers Companion's cascade hook
    }
  }
});

module.exports = mongoose.model("User", userSchema);
