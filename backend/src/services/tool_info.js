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
      name: "getAllLists",
      description: `Retrieves all To-Do lists for the user. Call this to view the user's lists, interests, what user is currently doing or to find the list_id of a specific list before deleting it.`,
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "deleteList",
      description: `Deletes a specific To-Do list. IMPORTANT: Before calling this tool, you must first call getAllLists to get the correct list_id from the context. Do not guess the list_id. Always Ask user for confirmation before deleting any list.`,
      parameters: {
        type: "object",
        properties: {
          list_id: {
            type: "string",
            description: "The _id of the list to delete. Must be retrieved by calling getAllLists first."
          }
        },
        required: ["list_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "addTask",
      description: `Adds a new task to an existing To-Do list. IMPORTANT: You must first call getAllLists to get the correct list_id from the context.`,
      parameters: {
        type: "object",
        properties: {
          list_id: {
            type: "string",
            description: "The _id of the list to add the task to."
          },
          task: {
            type: "string",
            description: "The text/description of the new task to add."
          }
        },
        required: ["list_id", "task"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "deleteListTask",
      description: `Deletes a specific task from an existing To-Do list. IMPORTANT: You must first call getAllLists to get the correct list_id and the task_id of the task you want to delete.`,
      parameters: {
        type: "object",
        properties: {
          list_id: {
            type: "string",
            description: "The _id of the list containing the task."
          },
          task_id: {
            type: "string",
            description: "The _id of the specific task to delete."
          }
        },
        required: ["list_id", "task_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "updateListTask",
      description: `Updates the text of an existing task in a To-Do list. IMPORTANT: You must first call getAllLists to get the correct list_id and the task_id of the task you want to update.`,
      parameters: {
        type: "object",
        properties: {
          list_id: {
            type: "string",
            description: "The _id of the list containing the task."
          },
          task_id: {
            type: "string",
            description: "The _id of the specific task to update."
          },
          updatedTask: {
            type: "string",
            description: "The new description/text for the task."
          }
        },
        required: ["list_id", "task_id", "updatedTask"]
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
  {
    type: "function",
    function: {
      name: "getAllNotes",
      description: `Retrieves all Notes for the user. Call this to view the user's notes, interests, what user is currently doing or to find the note_id of a specific note before deleting it.`,
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "deleteNote",
      description: `Deletes a specific Note. IMPORTANT: Before calling this tool, you must first call getAllNotes to get the correct note_id from the context. Do not guess the note_id. Always Ask user for confirmation before deleting any note.`,
      parameters: {
        type: "object",
        properties: {
          note_id: {
            type: "string",
            description: "The _id of the note to delete. Must be retrieved by calling getAllNotes first."
          }
        },
        required: ["note_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_memory",
      description: `Store a new fact, preference, or insight about the user into long-term memory. Call this whenever the user shares something worth remembering across sessions (e.g. name, preferences, goals, habits, personal facts).`,
      parameters: {
        type: "object",
        properties: {
          text:     { type: "string", description: "Plain sentence summarizing what to store. e.g. 'User loves horror movies'" },
        },
        required: ["text"], // pass user id and companion id manually
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_memories",
      description: `Search long-term memory for facts relevant to the current conversation.
Call this at the start of every response to recall what you know about this user.
The results contain an "id" field — this is the memory_id you must use if you need to update or delete a memory.`,
      parameters: {
        type: "object",
        properties: {
          query:    { type: "string", description: "Natural language description of what to find. e.g. 'user food preferences'" },
          limit:    { type: "integer", description: "Max results to return. Default 5." },
        },
        required: ["query"], // pass user id and companion id manually
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_all_memories",
      description: `Delete ALL memories for this user + companion pair permanently.
Only call this when the user explicitly asks to reset or clear everything you remember about them.`,
      parameters: {
        type: "object",
        properties: {
          confirm:  { type: "boolean", description: "Pass true to confirm deletion of all memories." },
        },
        required: ["confirm"],

      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_memory",
      description: `Overwrite an existing memory with new text.
IMPORTANT: You must call search_memories first to get the memory's "id" field.
Then pass that "id" as memory_id here.
Use this when the user corrects or updates something you already know about them
(e.g. they changed their preference or corrected a fact).`,
      parameters: {
        type: "object",
        properties: {
          memory_id: { type: "string", description: "The 'id' field returned from search_memories. Required." },
          text:      { type: "string", description: "The updated text to replace the old memory." },
        },
        required: ["memory_id", "text"],
      },
    },
  },
    {
    type: "function",
    function: {
      name: "delete_memory",
      description: `Delete a single memory permanently.
IMPORTANT: You must call search_memories first to get the memory's "id" field.
Then pass that "id" as memory_id here.
Only call this when the user explicitly asks you to forget something specific.`,
      parameters: {
        type: "object",
        properties: {
          memory_id: { type: "string", description: "The 'id' field returned from search_memories. Required." },
        },
        required: ["memory_id"],
      },
    },
  },
];

module.exports = tools;