# AI Companion Frontend

A Vite + React UI for the AI Companion app. It provides authentication, dashboards for companions/notes/lists, chat with history, analytics, and profile management. The UI is built with Tailwind CSS, framer-motion animations, and Recharts for analytics.

## Table of Contents
- Overview
- Tech Stack
- Project Structure
- Setup
- Environment Variables
- Scripts
- App Routing
- Key Pages
- Components
- State and API Integration
- Styling and UI
- Troubleshooting

## Overview
Core features:
- Login and signup with cookie-based auth
- Dashboard for companions, lists, and notes
- Chat experience with history sidebar and PDF export
- Companion creation wizard
- List and note editors with autosave behavior
- Analytics dashboards
- Profile management (avatar upload, logout, account delete)

## Tech Stack
- React (Vite)
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- React Markdown
- jsPDF
- Lucide React

## Project Structure
```
frontend/
  src/
    App.jsx
    main.jsx
    index.css
    auth/
    components/
    pages/
  public/
  .env
  package.json
  vite.config.js
```

## Setup
1) Install dependencies:
```
npm install
```

2) Set environment variables in .env (see below).

3) Run the dev server:
```
npm run dev
```

## Environment Variables
These are defined in [frontend/.env](frontend/.env) and used for API calls:
```
VITE_LOGIN_API_URL=/auth/signin
VITE_SIGNUP_API_URL=/auth/signup
VITE_LOGOUT_API_URL=/auth/signout
VITE_AUTH_API_URL=/auth/checkauth
VITE_DELETE_ACCOUNT_API_URL=/account/delete
VITE_GET_COMPANIONS_API_URL=/companion/getAll
VITE_CREATE_COMPANION_API_URL=/companion/create
VITE_DELETE_COMPANION_API_URL=/companion/delete
VITE_UPLOAD_AVATAR_API_URL=/account/avatar
VITE_GET_PROFILE_PICTURE=/account/avatar
VITE_GET_USER_API_URL=/account/
VITE_CHAT_API_URL=/chat
VITE_LIST_API_URL=/list
VITE_NOTE_API_URL=/note
VITE_ANALYTICS_API_URL=/analytics
```

## Scripts
From [frontend/package.json](frontend/package.json):
- `npm run dev` start Vite dev server

## App Routing
Routes are defined in [frontend/src/App.jsx](frontend/src/App.jsx):
- `/` -> Landing page
- `/login` -> Login
- `/signup` -> Signup
- `/dashboard` -> Dashboard
- `/analytics` -> Analytics
- `/createCompanion` -> Companion wizard
- `/createList` -> Create list
- `/createNote` -> Create note
- `/chat/:companionId` -> Chat
- `/list/:listId` -> List detail
- `/note/:noteId` -> Note detail
- `/profile` -> Profile

## Key Pages
- Dashboard: loads companions, lists, and notes, with search/filter and delete flows. See [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx).
- Chat: companion chat with history sidebar, markdown rendering, and PDF export. See [frontend/src/pages/Chat.jsx](frontend/src/pages/Chat.jsx) and [frontend/src/components/chatPage/sidebar.jsx](frontend/src/components/chatPage/sidebar.jsx).
- CreateCompanion: multi-step wizard for personality, style, expertise, system prompt, and avatar. See [frontend/src/pages/CreateCompanion.jsx](frontend/src/pages/CreateCompanion.jsx).
- Analytics: charts powered by Recharts. See [frontend/src/pages/Analytics.jsx](frontend/src/pages/Analytics.jsx).
- Profile: avatar upload, logout, and account delete. See [frontend/src/pages/Profile.jsx](frontend/src/pages/Profile.jsx).

## Components
- Dashboard cards and grids in [frontend/src/components/Dashboard](frontend/src/components/Dashboard).
- Chat history sidebar in [frontend/src/components/chatPage/sidebar.jsx](frontend/src/components/chatPage/sidebar.jsx).
- Reusable loading spinner in [frontend/src/components/Loading/loading.jsx](frontend/src/components/Loading/loading.jsx).

## State and API Integration
- Local state with React hooks (no global store).
- Auth guard uses `checkAuth()` in [frontend/src/auth/auth.js](frontend/src/auth/auth.js) on protected pages.
- API calls use `fetch()` with `credentials: "include"` for cookie auth.
- Base URLs are read from `import.meta.env`.

## Styling and UI
- Tailwind CSS is initialized in [frontend/src/index.css](frontend/src/index.css).
- Animated interactions use Framer Motion.
- UI uses glassmorphism patterns and gradients with a dark theme.