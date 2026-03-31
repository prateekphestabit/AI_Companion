const User = require("../models/User");
const logger = require("../utils/logger");

async function getHistory(req, res) {
  try {
    const userId = req.user._id;
    const { companionId } = req.params;

    const user = await User.findById(userId).select("companions");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const companion = user.companions.id(companionId);
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    // Return history list (title, id, timestamps) without full chatHistory for sidebar
    const historyList = companion.history.map((h) => ({
      _id: h._id,
      title: h.title,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    }));

    res.status(200).json({ success: true, history: historyList });
  } catch (error) {
    logger.error("Error in getHistory", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function getChatMessages(req, res) {
  try {
    const userId = req.user._id;
    const { companionId, historyId } = req.params;

    const user = await User.findById(userId).select("companions");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const companion = user.companions.id(companionId);
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    const historyEntry = companion.history.id(historyId);
    if (!historyEntry) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({
      success: true,
      title: historyEntry.title,
      chatHistory: historyEntry.chatHistory,
    });
  } catch (error) {
    logger.error("Error in getChatMessages", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function sendMessage(req, res) {
  try {
    const userId = req.user._id;
    const { companionId } = req.params;
    const { historyId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const companion = user.companions.id(companionId);
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    // Simulated AI response
    const aiReply = `This is a simulated response from ${companion.name}. Backend AI integration coming soon!`;

    let activeHistoryId = historyId;

    if (!historyId) {
      // New chat — create a new history entry
      const title = message.trim().substring(0, 50) + (message.trim().length > 50 ? "..." : "");
      companion.history.push({
        title,
        chatHistory: [
          { role: "user", content: message.trim() },
          { role: "assistant", content: aiReply },
        ],
      });
      await user.save();
      activeHistoryId = companion.history[companion.history.length - 1]._id;
    } else {
      // Existing chat — push to chatHistory
      const historyEntry = companion.history.id(historyId);
      if (!historyEntry) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }
      historyEntry.chatHistory.push({ role: "user", content: message.trim() });
      historyEntry.chatHistory.push({ role: "assistant", content: aiReply });
      await user.save();
    }

    res.status(200).json({
      success: true,
      historyId: activeHistoryId,
      reply: aiReply,
    });
  } catch (error) {
    logger.error("Error in sendMessage", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  getHistory,
  getChatMessages,
  sendMessage,
};
