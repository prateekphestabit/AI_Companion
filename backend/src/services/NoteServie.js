const User = require("../models/User");

async function createNoteService(userId, title, content){
    const user = await User.findById(userId);
    user.notes.push({ title: title.trim(), content: content.trim() });
    await user.save();
}

module.exports = { createNoteService };