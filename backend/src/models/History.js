const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    companionId: { type: mongoose.Schema.Types.ObjectId, ref: "Companion", required: true },
    title: { type: String, required: true, trim: true },
    chatHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

// Cascade delete: when a History doc is deleted, remove all its Messages
historySchema.pre('deleteOne', { document: true, query: false }, async function () {
  const Message = mongoose.model("Message");
  await Message.deleteMany({ historyId: this._id });
});

module.exports = mongoose.model("History", historySchema);
