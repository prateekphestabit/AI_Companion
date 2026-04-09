const { callMcpTool } = require("../loaders/mem0");
const {createListService} = require("../services/ListService");
const {createNoteService} = require("../services/NoteServie");
const User = require("../models/User");
const logger = require("../utils/logger");

// ================ MVP tools
async function create_list(title, tasks, userId){
  try {
    await createListService(userId, title, tasks);
    return `${title} List created successfully`;
  } catch (error) {
    logger.error("Error in create_list", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

//================ List Tools 
async function getAllLists(userId) {
  try {
    const user = await User.findById(userId).select("lists");
    if (!user) { return { success: false, message: "User not found" } }
    return { success: true, lists: user.lists};
  } catch (error) {
    logger.error("Error in getAllLists", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function deleteList(userId, listId){
  try {
    const user = await User.findByIdAndUpdate( userId,
      { $pull: { lists: { _id: listId } } },
      { returnDocument: "after" }
    );
    if(!user) return { success: false, message: "User or list was not found" };
    return { success: true, message: "List deleted successfully" };
  } catch (error) {
    logger.error("Error in deleteList", error);
    return { success: false, message: "Server error", error: error.message };
  }
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
  try {
    const user = await User.findById(userId).select("notes");
    if (!user) { return { success: false, message: "User not found" } }
    return { success: true, notes: user.notes};
  } catch (error) {
    logger.error("Error in getAllNotes", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

// ============= Note Tools 
async function deleteNote(userId, noteId){
  try {
    const user = await User.findByIdAndUpdate( userId,
      { $pull: { notes: { _id: noteId } } },
      { returnDocument: "after" }
    );
    if(!user) return { success: false, message: "User or note was not found" };
    return { success: true, message: "Note deleted successfully" };
  } catch (error) {
    logger.error("Error in deleteNote", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function create_Note(title, content, userId){
  try {
    await createNoteService(userId, title, content);
    return `${title} Note created successfully`;
  } catch (error) {
    logger.error("Error in create_Note", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function updateNote(userId, noteId, title, content) {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found" };

    const note = user.notes.id(noteId);
    if (!note) return { success: false, message: "Note not found" };

    if (title && title.trim()) note.title = title.trim();
    if (content !== undefined) note.content = content;
    await user.save();

    return { success: true, message: "Note updated", note };
  } catch (error) {
    logger.error("Error in updateNote", error);
    return { success: false, message: "Server error", error: error.message };
  }
}







// ====================== mem0 MCP Tools 
async function add_memory(text, userId, compId) {
  try {
    console.log(`adding ${text} to the memoary`);
    return await callMcpTool('add_memory', {
      text,   
      user_id: compId,
      // agent_id: compId, 
      async_mode: false,
    });
  } catch (error) {
    logger.error("Error in add_memory", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function search_memories(query, userId, compId, limit = 5) {
  try {
    return await callMcpTool('search_memories', {
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
  } catch (error) {
    logger.error("Error in search_memories", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function update_memory(memory_id, text) {
  try {
    return await callMcpTool('update_memory', { memory_id, text });
  } catch (error) {
    logger.error("Error in update_memory", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function delete_memory(memory_id) {
  try {
    return await callMcpTool('delete_memory', { memory_id });
  } catch (error) {
    logger.error("Error in delete_memory", error);
    return { success: false, message: "Server error", error: error.message };
  }
}

async function delete_all_memories(userId, compId) {
  try {
    return await callMcpTool('delete_all_memories', { 
      user_id: compId,
      // agent_id: compId 
    });
  } catch (error) {
    logger.error("Error in delete_all_memories", error);
    return { success: false, message: "Server error", error: error.message };
  }
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
  updateNote,
  add_memory,
  search_memories,
  update_memory,
  delete_memory,
  delete_all_memories,
};