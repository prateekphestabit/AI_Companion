const { callMcpTool } = require("../loaders/mem0");
const {createListService} = require("../services/ListService");
const {createNoteService} = require("../services/NoteServie");

// ================ MVP tools
async function create_list(title, tasks, userId){
    await createListService(userId, title, tasks);
    return `${title} List created successfully`;
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
  create_Note,
  add_memory,
  search_memories,
  update_memory,
  delete_memory,
  delete_all_memories,
};