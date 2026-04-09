const { callMcpTool } = require("../loaders/mem0");
const {createListService} = require("../services/ListService");
const {createNoteService} = require("../services/NoteServie");
const User = require("../models/User");
const logger = require("../utils/logger");

// ================ MVP tools ==> add try catch to each tool
async function create_list(title, tasks, userId){
    await createListService(userId, title, tasks);
    return `${title} List created successfully`;
}

//================ List Tools 
async function getAllLists(userId) {
  const user = await User.findById(userId).select("lists");
  if (!user) { return { success: false, message: "User not found" } }
  return { success: true, lists: user.lists};
}

async function deleteList(userId, listId){
  const user = await User.findByIdAndUpdate( userId,
    { $pull: { lists: { _id: listId } } },
    { returnDocument: "after" }
  );
  if(!user) return { success: false, message: "User or list was not found" };
  return { success: true, message: "List deleted successfully" };
}

async function deleteListTask(userId, listId, taskId) {
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const list = user.lists.id(listId);
    if (!list) return res.status(404).json({ success: false, message: "List not found" });
    
    const task = list.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    list.tasks.pull(taskId);
    await user.save();

    return { success: true, message: "Task deleted" };
  } catch (error) {
    logger.error("Error in deleteTask", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function addTask(userId, listId, task) {
  try {
    if (!task || !task.trim()) return { success: false, message: "Task text is required" };

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    const list = user.lists.id(listId);
    if (!list) return res.status(404).json({ success: false, message: "List not found" });

    list.tasks.push({ task: task.trim(), state: false });
    await user.save();

    const createdTask = list.tasks[list.tasks.length - 1];
    return { success: true, message: "Task added", task: createdTask };
  } catch (error) {
    logger.error("Error in addTask", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function updateListTask(userId, listId, taskId, updatedTask){
  try {
    await deleteListTask(userId, listId, taskId);
    await addTask(userId, listId, updatedTask);
    return { success: true, message: "List updated successfully" };
  } catch (error) {
    logger.error("Error in updateList", error);
    return { success: false, message: "Server error", error: error.message };
  }
}
  
async function getAllNotes(userId) {
  const user = await User.findById(userId).select("notes");
  if (!user) { return { success: false, message: "User not found" } }
  return { success: true, notes: user.notes};
}

async function deleteNote(userId, noteId){
  const user = await User.findByIdAndUpdate( userId,
    { $pull: { notes: { _id: noteId } } },
    { returnDocument: "after" }
  );
  if(!user) return { success: false, message: "User or note was not found" };
  return { success: true, message: "Note deleted successfully" };
}

async function create_Note(title, content, userId){
    await createNoteService(userId, title, content);
    return `${title} Note created successfully`;
}

// ====================== mem0 MCP Tools 
async function add_memory(text, userId, compId) {
  console.log(`adding ${text} to the memoary`);
  return callMcpTool('add_memory', {
    text,   
    user_id: compId,
    // agent_id: compId, 
    async_mode: false,
  });
}

async function search_memories(query, userId, compId, limit = 5) {
  return callMcpTool('search_memories', {
    query,
    limit,
    filters: { 
      AND: [
        {
          user_id: compId
        },
        // {
        //   agent_id: compId 
        // }
      ]
    },
    keyword_search: false,
    async_mode: false,
  });
}

async function update_memory(memory_id, text) {
  return callMcpTool('update_memory', { memory_id, text });
}

async function delete_memory(memory_id) {
  return callMcpTool('delete_memory', { memory_id });
}

async function delete_all_memories(userId, compId) {
  return callMcpTool('delete_all_memories', { 
    user_id: compId,
    // agent_id: compId 
  });
}

module.exports = {
  create_list,
  getAllLists,
  deleteList,
  deleteListTask,
  addTask,
  updateListTask,
  getAllNotes,
  deleteNote,
  create_Note,
  add_memory,
  search_memories,
  update_memory,
  delete_memory,
  delete_all_memories,
};