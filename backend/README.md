# AI Companion Backend

A Node.js/Express REST API that powers the AI Companion app. It provides user auth, customizable AI companions, chat with tool-calling, notes and lists, and analytics. Data is stored in MongoDB. The chat pipeline integrates NVIDIA Mistral (via OpenAI SDK configured with a custom base URL) and Mem0 through MCP for memory.

## Table of Contents
- Overview
- Tech Stack
- Project Structure
- Setup and Configuration
- Environment Variables
- Scripts
- Request Flow
- Data Models
- API Reference
- Chat and Tool Calling
- Logging
- Security and Operational Notes
- Troubleshooting

## Overview
Core capabilities:
- JWT-based authentication with httpOnly cookies
- Manage AI companions (create, edit, duplicate, delete)
- Conversations with history, title generation, and tool calling
- Notes and lists (embedded on the user document)
- Analytics per companion
- Dev-only routes for test data management

## Tech Stack
- Node.js + Express (CommonJS)
- MongoDB + Mongoose
- JWT + bcryptjs
- Multer (avatar uploads)
- Winston logging
- LLM: NVIDIA Mistral (via OpenAI SDK)
- Memory: Mem0 MCP client

## Project Structure
```
backend/
  src/
    app.js
    config/
      DBconnection.js
    controllers/
    loaders/
    middlewares/
    models/
    routes/
    services/
    utils/
  logs/
  .env
  package.json
```

## Setup and Configuration
1) Install dependencies:
```
npm install
```

2) Create a .env file and provide required values (see Environment Variables section).

3) Run the server:
```
npm run dev
```

The default port is 4000 (see .env).

## Environment Variables

```
MONGODB_URI=DB_URL
PORT=portNumber
JWT_SECRET=JWT_SECRET
CORS_ORIGIN1=FRONTEND_URL1
CORS_ORIGIN2=FRONTEND_URL2
LLM_API_KEY=your-nvidia-api-key
MEM0_API_KEY=your-mem0-api-key
MEM0_MCP_URL=MEM0_MCP_URL
```

## Scripts
From [backend/package.json](backend/package.json):
- `npm start` starts the server with nodemon

## Request Flow
Startup is orchestrated by [src/loaders/loader.js](backend/src/loaders/loader.js):
1) DB connection
2) Express middleware and CORS
3) Router mounting
4) Mem0 MCP client setup
5) App listener start

Authentication middleware in [src/middlewares/auth.js](backend/src/middlewares/auth.js) validates JWT cookies for all routes except /auth and /dev.

## Data Models
Models live in [backend/src/models](backend/src/models):

User
- name, email, password (bcrypt)
- avatar (Buffer)
- companions: [ObjectId -> Companion]
- lists: [embedded ListSchema]
- notes: [embedded NoteSchema]

Companion
- userId, name, avatar, description
- personality, communicationStyle, expertise
- systemPrompt
- history: [ObjectId -> History]

History
- companionId
- title
- chatHistory: [ObjectId -> Message]

Message
- historyId
- role: system | user | assistant | agent
- content

List (embedded)
- title
- tasks: [{ task, state: boolean }]

Note (embedded)
- title
- content

Cascade delete behavior:
- Deleting a User deletes Companions, which deletes Histories, which deletes Messages.

## API Reference
All endpoints are mounted in [backend/src/routes](backend/src/routes).

### Auth (no auth required)
- POST /auth/signin
- POST /auth/signup
- GET /auth/signout
- GET /auth/checkauth

### Account (auth required)
- GET /account
- POST /account/avatar
- DELETE /account/delete

### Companion (auth required)
- GET /companion/getAll
- POST /companion/create
- PUT /companion/edit
- POST /companion/duplicate
- DELETE /companion/delete

### Chat (auth required)
- GET /chat/:companionId/history
- GET /chat/:companionId/history/:historyId
- POST /chat/:companionId/send
- DELETE /chat/:companionId/history/:historyId

### Lists (auth required)
- GET /list/getAll
- GET /list/:listId
- POST /list/create
- PUT /list/:listId
- DELETE /list/delete
- POST /list/:listId/task
- PUT /list/:listId/task/:taskId/toggle
- DELETE /list/:listId/task/:taskId

### Notes (auth required)
- GET /note/getAll
- GET /note/:noteId
- POST /note/create
- PUT /note/:noteId
- DELETE /note/delete

### Analytics (auth required)
- GET /analytics

### Dev (no auth, use only in local/dev)
- GET /dev/user/:id
- DELETE /dev/user/:id
- POST /dev/user
- GET /dev/allUsers
- DELETE /dev/allUsers
- POST /dev/companion
- DELETE /dev/companion

## Chat and Tool Calling
The core flow is in [backend/src/controllers/chat.js](backend/src/controllers/chat.js):
- For a new conversation, a History document is created first.
- The chat pipeline calls the LLM and stores the user + assistant messages.
- A conversation title is generated with a dedicated LLM call.

Tool calling is implemented in:
- Tool schemas: [backend/src/services/tool_info.js](backend/src/services/tool_info.js)
- Tool handlers: [backend/src/services/tools.js](backend/src/services/tools.js)
- LLM loop: [backend/src/services/chatWithTools.js](backend/src/services/chatWithTools.js)

Supported tools include list and note operations (create, update, delete, fetch). The system prompt instructs the assistant to call memory and data tools before responding.

## Logging
Logging is centralized in [backend/src/utils/logger.js](backend/src/utils/logger.js). Winston writes to:
- logs/combined.log
- logs/error.log
- console

## Security and Operational Notes
- Dev routes are unauthenticated and can wipe data. Keep them disabled in production.
- No refresh tokens are implemented; JWT expires after 24 hours.
- Validation is minimal; add request validation for production use.
- Consider file size limits for avatar uploads.