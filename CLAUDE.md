# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive training tool for presenters/trainers to engage participants in real-time through word clouds, quizzes, and polls. Participants join via a 6-character session code.

## Commands

```bash
# Start both client and server in development
npm run dev

# Start only the client (port 5173)
npm run dev:client

# Start only the server (port 3001)
npm run dev:server

# Build client for production
npm run build
```

## Architecture

**Monorepo** with npm workspaces: `client/` and `server/`

### Client (React + Vite)
- **Contexts**: `SocketContext` manages Socket.io connection, `SessionContext` manages session state and API calls
- **Routes**:
  - `/` - Home (role selection: presenter or participant)
  - `/sessions` - Session manager (presenter creates/manages multiple sessions)
  - `/presenter/:sessionCode` - Presenter dashboard for a specific session
  - `/participant/:sessionCode` - Participant view
  - `/present/:sessionCode` - Full-screen presentation mode
- **Activity types**: wordcloud, quiz, poll
- **Component pattern**: `components/activities/` for creation forms, `components/participant/` for input forms, `components/results/` for visualizations

### Server (Express + Socket.io)
- **Database**: lowdb (JSON file at `server/data/db.json`)
- **API routes**:
  - `/api/sessions` - CRUD for sessions (list, create, delete, end, reactivate)
  - `/api/activities` - Activity management (create, start, stop, respond)
- **Socket events**: session:join, activity:start/stop, response:submit
- **Data model**: sessions → activities → responses, with participants per session

### User Flows

**Presenter flow**:
1. Home → "Je suis formateur" → Session manager (`/sessions`)
2. Create/select a session → Presenter dashboard
3. Create activities, launch them, view real-time results
4. Open presentation mode in separate window

**Participant flow**:
1. Home → "Je suis participant" → Enter session code
2. Wait for activity → Submit response → See confirmation

### Real-time Flow
1. Presenter creates session → gets 6-char code
2. Participants join with code → Socket.io room `session:{code}`
3. Presenter starts activity → broadcast to room
4. Participants submit → response broadcast to presenter
5. Results update live via `response:new` events

## Key Files

- `server/src/db/database.js` - Database queries (lowdb wrapper)
- `server/src/socket/handlers.js` - Socket.io event handlers
- `server/src/routes/sessions.js` - Session CRUD API
- `client/src/pages/SessionManager.jsx` - Multi-session management UI
- `client/src/context/SessionContext.jsx` - Session state + API methods
