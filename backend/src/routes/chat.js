const chatRouter = require("express").Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  getHistory,
  getChatMessages,
  sendMessage,
  deleteHistory,
} = require("../controllers/chat.js");

chatRouter.route("/:companionId/history")
  .get(getHistory);

chatRouter.route("/:companionId/history/:historyId")
  .get(getChatMessages)
  .delete(deleteHistory);

chatRouter.route("/:companionId/send")
  .post(upload.single('file'), sendMessage);

module.exports = chatRouter;

// base route /chat
