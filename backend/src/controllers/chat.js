const Companion = require("../models/Companion");
const History = require("../models/History");
const Message = require("../models/Message");
const logger = require("../utils/logger");
const { getTopic } = require("../services/chatTitle");
const { llmResponse } = require("../services/chatWithTools");
const { extractFileText } = require("../utils/textExtractor");

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
      .sort({ updatedAt: 1 });

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
    
    // =========== DB validations ================ 
    const userId = req.user._id;
    const { companionId } = req.params;
    let { historyId, message } = req.body;
    const file = req.file;

    if (!message || !message.trim()) return res.status(400).json({ success: false, message: "Message is required" });

    const companion = await Companion.findOne({ _id: companionId, userId });
    if (!companion) return res.status(404).json({ success: false, message: "Companion not found" });

    
    // =========== Text Extraction from file ============
    const extractedFileText = file?  await extractFileText(file) : null;
    logger.info('Text extraction completed');

    // 1. ===== fetch system prompt + add tool calling instructions =====
    const systemInstruction = companion.systemPrompt + 
    "\n\nCRITICAL CONTEXT: before answering any user query, ALWAYS CALL THESE THREE TOOLS search_memories, getAllLists and getAllNotes";
    
    // 2. ===== create msg array + system prompt 
    const messages = [{ "role": "system", "content": systemInstruction }];

    // 3. ===== from ==>History<== populate msg array with recent 50 msgs
    logger.info('fetching msgs from history');
    let history = null;
    if(historyId){
      const numberOfMessagesInMemory = 50;

      // 3.1 ==> fetch history
      history = await History.findOne({ _id: historyId, companionId }).populate("chatHistory");
      if (!history) return res.status(404).json({ success: false, message: "Chat not found" });

      // 3.2 ==> get recent 50 msgs
      const chats = history.chatHistory;
      const recentChats = chats.slice(-numberOfMessagesInMemory);

      // 3.3 ==> push to msg array
      for (const chat of recentChats) {
        messages.push({ role: chat.role, content: chat.content });
      }
    }
    logger.info('msgs from history fetched successfully');
    // 4. ===== push file text
    if(extractedFileText) messages.push({role: 'user', content: `File attached: ${file.originalname} \n Content: \n ${extractedFileText}`});

    // 5. ===== push user msg
    messages.push({role: 'user', content: message.trim()});
    
    // 6. ===== Call llm =====
    logger.info('calling llm');
    const aiReply = await llmResponse(messages, userId, companionId);
    
    // 7. ===== create History if not exist =====
    if(!historyId) {
      logger.info('creating history for first message');

      // 7.1 ===== title generation prompt =====
      const contentForTitle = `
        Generate a short title (max 5 words).
        Return ONLY plain text. No quotes, no formatting.

        Message:
        ${message}

        response:
        ${aiReply}
      `;

      // 7.2 ===== get title using llm
      const title = await getTopic([{ "role": "user", "content": contentForTitle }]);
      
      // 7.3 ===== create History =====
      history = await History.create({
        companionId,
        title,
        chatHistory: []
      });
      
      // 7.4 ===== push history ID to companion =====
      await Companion.findByIdAndUpdate(companionId, {
        $push: { history: history._id }
      });
      
      historyId = history._id;
      logger.info('history created successfully');
    }

    // 8. ===== create msg docs =====
    const userDocContentMSG = extractedFileText ? await Message.create({ historyId: history._id, role: "user", content: `File attached: ${file.originalname} \n Content: \n ${extractedFileText}` }) : null;
    const userMsg = await Message.create({ historyId: history._id, role: "user", content: message.trim() });
    const assistantMsg = await Message.create({ historyId: history._id, role: "assistant", content: aiReply });
    
    const ids = [ userDocContentMSG?._id, userMsg._id, assistantMsg._id ].filter(Boolean);

    // 9. ===== push msg ids to history =====
    await History.findByIdAndUpdate(historyId, { $push: { chatHistory: { $each: ids } } });
    logger.info('msg uploaded to DB successfully');

    res.status(200).json({
      success: true,
      historyId: historyId,
      reply: aiReply,
    });

  } catch (error) {
    logger.error("Error in sendMessage:", error);
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
