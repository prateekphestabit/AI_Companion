const OpenAI = require('openai');
const logger = require('../utils/logger');
const toolsInfo = require("./tool_info");
const toolHandlers = require("./tools");

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function llmResponse(messages, userId, compId) {
  while(1){
    try {
      const completion = await openai.chat.completions.create({
        model: "mistralai/devstral-2-123b-instruct-2512",
        messages: messages,
        temperature: 0.15,
        top_p: 0.95,
        max_tokens: 8192,
        stream: false,
        tools: toolsInfo,           
        tool_choice: "auto",
      })

      const reply = completion.choices[0].message;
      if(!reply.tool_calls || reply.tool_calls.length === 0){
        logger.info("query was answered by the companion");
        return reply.content;
      } 
      
      messages.push(reply);
      
      for(const tool of reply.tool_calls){
          
        const toolName = tool.function.name;
        const args = JSON.parse(tool.function.arguments);
        
        let result = "Tool not found or unsupported.";
        if (toolHandlers[toolName]) {
          try {
            logger.info(`calling tool ${toolName}`);
            if (toolName === "create_list"){
              result = await toolHandlers.create_list(args.title, args.tasks, userId);
            } 
            else if (toolName === "getAllLists"){
              result = await toolHandlers.getAllLists(userId);
            }
            else if (toolName === "deleteList"){
              result = await toolHandlers.deleteList(userId, args.list_id);
            }
            else if (toolName === "create_Note"){
              result = await toolHandlers.create_Note(args.title, args.content, userId);
            } 
            else if (toolName === "getAllNotes"){
              result = await toolHandlers.getAllNotes(userId);
            }
            else if (toolName === "deleteNote"){
              result = await toolHandlers.deleteNote(userId, args.note_id);
            } 
            else if (toolName === "add_memory"){
              result = await toolHandlers.add_memory(args.text, userId, compId);
              console.log(`added ${args.text} to the memoary`);
              console.log(result);
            }
            else if (toolName === "search_memories"){
              result = await toolHandlers.search_memories(args.query, userId, compId);
              console.log(result);
            }
            else if (toolName === "update_memory"){
              result = await toolHandlers.update_memory(args.memory_id, args.text);

            }
            else if (toolName === "delete_memory"){
              result = await toolHandlers.delete_memory(args.memory_id);

            }
            else if (toolName === "delete_all_memories") result = await toolHandlers.delete_all_memories(userId, compId);
            if (typeof result !== 'string') {
              result = JSON.stringify(result);
            }
          } catch (err) {
            logger.error(`Error executing tool ${toolName}:`, err);
            result = `Error: ${err.message}`;
          }
        } else {
          logger.info(`Unknown tool called: ${toolName}`);
        }
        
        messages.push({
            role: "tool",
            tool_call_id: tool.id,
            content: result,
        });
      }
      
    } 
    catch (error) {
      let err;
      // if(error.message) err = error.message.toString();
      // else err = error.toString();

      logger.error(`Error creating completion in llmResponse: ${error}`);
      return "I apologize, but I am currently experiencing connection issues. Please try again later.";
    }
  }
}

module.exports = { llmResponse };