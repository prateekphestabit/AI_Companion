const Companion = require("../models/Companion");
const History = require("../models/History");
const Message = require("../models/Message");
const logger = require("../utils/logger");
const { getTopic } = require("../services/chat");
const { llmResponse } = require("../services/chatWithTools");

async function getHistory(req, res) {
  try {
    const userId = req.user._id;
    const { companionId } = req.params;

    const companion = await Companion.findOne({ _id: companionId, userId });
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    // Get history list (title, id, timestamps) without full chatHistory for sidebar
    const historyList = await History.find({ companionId })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 });

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

    const companion = await Companion.findOne({ _id: companionId, userId });
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    const historyEntry = await History.findOne({ _id: historyId, companionId }).populate("chatHistory");
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

    const companion = await Companion.findOne({ _id: companionId, userId });
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    const systemInstruction = companion.systemPrompt + "\n\nCRITICAL CONTEXT: You have a long-term memory system. If the user asks about their name, preferences, or past information that isn't in this immediate chat window, you MUST proactively call the 'search_memories' tool to retrieve it before answering. Do not say you don't know without searching first.";
    const messages = [{ "role": "system", "content": systemInstruction }];

    let aiReply;
    let activeHistoryId = historyId;

    if (!historyId) {
      // ── New conversation ──
      messages.push({ "role": "user", "content": message.trim() });
      aiReply = await llmResponse(messages, userId, companionId);

      const contentForTitle = `
        Generate a short title (max 5 words).
        Return ONLY plain text. No quotes, no formatting.

        Message:
        ${message}

        response:
        ${aiReply}
      `;
      const title = await getTopic([{ "role": "user", "content": contentForTitle }]);

      // Create History doc first
      const history = await History.create({
        companionId,
        title,
        chatHistory: []
      });

      // Create Message docs
      const userMsg = await Message.create({ historyId: history._id, role: "user", content: message.trim() });
      const assistantMsg = await Message.create({ historyId: history._id, role: "assistant", content: aiReply });

      // Push message IDs into history
      history.chatHistory.push(userMsg._id, assistantMsg._id);
      await history.save();

      // Push history ID into companion
      companion.history.push(history._id);
      await companion.save();

      activeHistoryId = history._id;
    }
    else {
      // ── Existing conversation ──
      const numberOfMessagesInMemory = 100;

      const historyEntry = await History.findOne({ _id: historyId, companionId }).populate("chatHistory");
      if (!historyEntry) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      const chats = historyEntry.chatHistory;
      const recentChats = chats.slice(-numberOfMessagesInMemory);

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

      aiReply = await llmResponse(messages, userId, companionId);

      // Create Message docs
      const userMsg = await Message.create({ historyId, role: "user", content: message.trim() });
      const assistantMsg = await Message.create({ historyId, role: "assistant", content: aiReply });

      // Push message IDs into history
      await History.findByIdAndUpdate(historyId, {
        $push: { chatHistory: { $each: [userMsg._id, assistantMsg._id] } }
      });
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

async function deleteHistory(req, res) {
  try {
    const userId = req.user._id;
    const { companionId, historyId } = req.params;

    const companion = await Companion.findOne({ _id: companionId, userId });
    if (!companion) {
      return res.status(404).json({ success: false, message: "Companion not found" });
    }

    const history = await History.findOne({ _id: historyId, companionId });
    if (!history) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // deleteOne triggers cascade hook (deletes all Messages)
    await history.deleteOne();

    // Pull history ID from companion's history array
    await Companion.findByIdAndUpdate(companionId, { $pull: { history: historyId } });

    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (error) {
    logger.error("Error in deleteHistory", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  getHistory,
  getChatMessages,
  sendMessage,
  deleteHistory,
};
