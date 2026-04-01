const User = require("../models/User");
const logger = require("../utils/logger");

async function getAllLists(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("lists");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const listSummaries = user.lists.map((l) => ({
      _id: l._id,
      title: l.title,
      taskCount: l.tasks.length,
      doneCount: l.tasks.filter((t) => t.state).length,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));

    res.status(200).json({ success: true, lists: listSummaries });
  } catch (error) {
    logger.error("Error in getAllLists", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function getList(req, res) {
  try {
    const userId = req.user._id;
    const { listId } = req.params;

    const user = await User.findById(userId).select("lists");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const list = user.lists.id(listId);
    if (!list) {
      return res.status(404).json({ success: false, message: "List not found" });
    }

    res.status(200).json({ success: true, list });
  } catch (error) {
    logger.error("Error in getList", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function createList(req, res) {
  try {
    const userId = req.user._id;
    const { title, tasks } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const taskArray = (tasks || []).map((t) => ({
      task: typeof t === "string" ? t : t.task,
      state: false,
    }));

    user.lists.push({ title: title.trim(), tasks: taskArray });
    await user.save();

    const createdList = user.lists[user.lists.length - 1];
    res.status(201).json({ success: true, message: "List created", list: createdList });
  } catch (error) {
    logger.error("Error in createList", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function deleteList(req, res) {
  try {
    const { listId } = req.body;
    const userId = req.user._id;

    if (!listId) {
      return res.status(400).json({ success: false, message: "listId is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { lists: { _id: listId } } },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "List deleted" });
  } catch (error) {
    logger.error("Error in deleteList", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function updateList(req, res) {
  try {
    const userId = req.user._id;
    const { listId } = req.params;
    const { title } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const list = user.lists.id(listId);
    if (!list) {
      return res.status(404).json({ success: false, message: "List not found" });
    }

    if (title && title.trim()) list.title = title.trim();
    await user.save();

    res.status(200).json({ success: true, message: "List updated", list });
  } catch (error) {
    logger.error("Error in updateList", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function addTask(req, res) {
  try {
    const userId = req.user._id;
    const { listId } = req.params;
    const { task } = req.body;

    if (!task || !task.trim()) {
      return res.status(400).json({ success: false, message: "Task text is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const list = user.lists.id(listId);
    if (!list) {
      return res.status(404).json({ success: false, message: "List not found" });
    }

    list.tasks.push({ task: task.trim(), state: false });
    await user.save();

    const createdTask = list.tasks[list.tasks.length - 1];
    res.status(201).json({ success: true, message: "Task added", task: createdTask });
  } catch (error) {
    logger.error("Error in addTask", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function toggleTask(req, res) {
  try {
    const userId = req.user._id;
    const { listId, taskId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const list = user.lists.id(listId);
    if (!list) {
      return res.status(404).json({ success: false, message: "List not found" });
    }

    const task = list.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.state = !task.state;
    await user.save();

    res.status(200).json({ success: true, message: "Task toggled", task });
  } catch (error) {
    logger.error("Error in toggleTask", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function deleteTask(req, res) {
  try {
    const userId = req.user._id;
    const { listId, taskId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const list = user.lists.id(listId);
    if (!list) {
      return res.status(404).json({ success: false, message: "List not found" });
    }

    const task = list.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    list.tasks.pull(taskId);
    await user.save();

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    logger.error("Error in deleteTask", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  getAllLists,
  getList,
  createList,
  deleteList,
  updateList,
  addTask,
  toggleTask,
  deleteTask,
};
