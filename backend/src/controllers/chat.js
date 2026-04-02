const User = require("../models/User");
const logger = require("../utils/logger");
const { getTopic } = require("../services/chat");
const { llmResponse } = require("../services/chatWithTools");

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

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let companion = user.companions.id(companionId);
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    const messages = [{"role": "system", "content": companion.systemPrompt}]

    let aiReply;

    let activeHistoryId = historyId;

    if (!historyId) {
      messages.push({ "role": "user", "content": message.trim() });
      aiReply = await llmResponse(messages, userId);

      const contentForTitle = `
        Generate a short title (max 5 words).
        Return ONLY plain text. No quotes, no formatting.

        Message:
        ${message}

        response:
        ${aiReply}
      `;
      const title = await getTopic([{ "role": "user", "content": contentForTitle }]);
      // New chat — create a new history entry

      user = await User.findById(userId);
      companion = user.companions.id(companionId);
      companion.history.push({
        title,
        chatHistory: [
          { role: "user", content: message.trim() },
          { role: "assistant", content: aiReply },
        ],
      });
      await user.save();
      activeHistoryId = companion.history[companion.history.length - 1]._id;
    } 
    else {
      const numberOfMessagesInMemoary = 100;
      // Existing chat — push to chatHistory

      const chats = companion.history.id(historyId).chatHistory;
      const recentChats = chats.slice(-numberOfMessagesInMemoary); 

      for (const chat of recentChats) {
        messages.push({
          role: chat.role,
          content: chat.content
        });
      }

      messages.push({
        role: 'user',
        content: message.trim()
      });
      
      aiReply = await llmResponse(messages, userId);
      user = await User.findById(userId);
      companion = user.companions.id(companionId);
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
