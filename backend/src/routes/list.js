const listRouter = require("express").Router();

const {
  getAllLists,
  getList,
  createList,
  deleteList,
  updateList,
  addTask,
  toggleTask,
  deleteTask,
} = require("../controllers/list.js");

listRouter.route("/getAll").get(getAllLists);
listRouter.route("/create").post(createList);
listRouter.route("/delete").delete(deleteList);
listRouter.route("/:listId").get(getList);
listRouter.route("/:listId").put(updateList);
listRouter.route("/:listId/task").post(addTask);
listRouter.route("/:listId/task/:taskId/toggle").put(toggleTask);
listRouter.route("/:listId/task/:taskId").delete(deleteTask);

module.exports = listRouter;

// base route /list
