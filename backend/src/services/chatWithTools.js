const OpenAI = require('openai');
const logger = require('../utils/logger');
const {createListService} = require("../services/ListService");
const {createNoteService} = require("../services/NoteServie");
require('dotenv').config();

const tools = [
  {
    type: "function",
    function: {
      name: "create_list",
      description: `Creates a To-Do list for the user. 
        Use this to break down a topic into actionable steps.
        Call this multiple times if tasks can be grouped (e.g. Morning and Evening routines = 2 separate lists).
        Each task should be a short, actionable step.
        or user can ask you to create lists only`,
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A specific title for this group of tasks e.g. 'Morning Skin Care Routine'"
          },
          tasks: {
            type: "array",
            items: { type: "string" },
            description: "Short actionable steps e.g. ['Apply Cleanser', 'Apply Toner']"
          }
        },
        required: ["title", "tasks"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_Note",
      description: `Creates a Note for the user.
        Use this to explain the WHY behind the tasks in the to-do lists.
        For example, explain why each step is important, what order to follow, and any tips.
        or user can ask you to create notes only`,
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the note e.g. 'Why This Skin Care Routine Works'"
          },
          content: {
            type: "string",
            description: "A detailed explanation of the topic. Explain the reasoning, benefits, and tips."
          }
        },
        required: ["title", "content"]
      }
    }
  },
];

async function create_List(title, tasks, userId){
    await createListService(userId, title, tasks);
    return `${title} List created successfully`;
}

async function create_Note(title, content, userId){
    await createNoteService(userId, title, content);
    return `${title} Note created successfully`;
}

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function llmResponse(messages, userId) {
    while(1){
        try {
            const completion = await openai.chat.completions.create({
                model: "mistralai/devstral-2-123b-instruct-2512",
                messages: messages,
                temperature: 0.15,
                top_p: 0.95,
                max_tokens: 8192,
                stream: false,
                tools: tools,           
                tool_choice: "auto",
            })

            const reply = completion.choices[0].message;
            if(!reply.tool_calls || reply.tool_calls.length === 0) return reply.content;
            
            messages.push(reply);
            

            for(const tool of reply.tool_calls){
                
                const toolName = tool.function.name;
                const args = JSON.parse(tool.function.arguments);
                
                let result;
                if(toolName === "create_list") result = await create_List(args.title, args.tasks, userId);
                else if(toolName === "create_Note") result = await create_Note(args.title, args.content, userId);
                
                messages.push({
                    role: "tool",
                    tool_call_id: tool.id,
                    content: result,
                });
            }
            
        } catch (error) {
            logger.error("Error creating completion:", error);
            break;
        }
    }
}

module.exports = { llmResponse };