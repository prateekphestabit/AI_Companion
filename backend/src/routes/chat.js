const chatRouter = require("express").Router();

const {
  getHistory,
  getChatMessages,
  sendMessage,
} = require("../controllers/chat.js");

chatRouter.route("/:companionId/history")
  .get(getHistory);

chatRouter.route("/:companionId/history/:historyId")
  .get(getChatMessages);

chatRouter.route("/:companionId/send")
  .post(sendMessage);

module.exports = chatRouter;

// base route /chat
