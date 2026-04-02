const User = require("../models/User");

async function createListService(userId, title, tasks){
    const user = await User.findById(userId);

    const taskArray = (tasks || []).map((t) => ({
      task: typeof t === "string" ? t : t.task,
      state: false,
    }));

    user.lists.push({ title: title.trim(), tasks: taskArray });
    await user.save();
}

module.exports = { createListService };
