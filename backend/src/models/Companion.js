const mongoose = require("mongoose");

const companionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:               { type: String, required: true, trim: true }, 
    avatar:             { type: Buffer, default: null },
    description:        { type: String, trim: true },
    personality:        { type: String, trim: true },
    communicationStyle: { type: String, trim: true },
    expertise:          { type: String, trim: true },
    systemPrompt:       { type: String, trim: true },
    history:            [{ type: mongoose.Schema.Types.ObjectId, ref: "History" }],
  },
  { timestamps: true }
);

// Cascade delete: when a Companion is deleted, remove all its Histories (which cascade to Messages)
companionSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const History = mongoose.model("History");
  const histories = await History.find({ companionId: this._id });
  for (const history of histories) {
    await history.deleteOne(); // triggers History's cascade hook
  }
});

module.exports = mongoose.model("Companion", companionSchema);
