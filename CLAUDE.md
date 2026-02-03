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

## Deployment

**GitHub Repository**: https://github.com/Indestructim/formation-interactive.git

### Vercel (Frontend)
- Auto-deploys from `main` branch
- Root directory: `/` (project root)
- Build command: `cd client && npm install && npm run build`
- Output directory: `client/dist`
- Environment variable: `VITE_API_URL` = Render backend URL

### Render (Backend)
- Auto-deploys from `main` branch
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `ALLOWED_ORIGINS` (optional, all *.vercel.app allowed by default)

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
- **Config**: `client/src/lib/config.js` exports `API_URL` from `VITE_API_URL`

### Server (Express + Socket.io)
- **Database**: lowdb (JSON file at `server/data/db.json`)
- **API routes**:
  - `/api/sessions` - CRUD for sessions (list, create, delete, end, reactivate)
  - `/api/activities` - Activity management (create, start, stop, respond)
  - `/api/health` - Health check with debug info
- **Socket events**: session:join, activity:start/stop, response:submit, response:progress, activity:resultsReady
- **Data model**: sessions → activities → responses, with participants per session
- **CORS**: Configured in `server/src/index.js`, allows all `*.vercel.app` domains

### User Flows

**Presenter flow**:
1. Home → "Je suis formateur" → Session manager (`/sessions`)
2. Create/select a session → Presenter dashboard
3. Create activities, launch them, view results when all respond
4. Open presentation mode in separate window

**Participant flow**:
1. Home → "Je suis participant" → Enter session code
2. Wait for activity → Submit response → See confirmation

### Real-time Flow (Delayed Results)
1. Presenter creates session → gets 6-char code
2. Participants join with code → Socket.io room `session:{code}`
3. Presenter starts activity → `activity:started` with `expectedCount` (participant count at start)
4. Participants submit → `response:progress` broadcasts count (X/Y responded)
5. When all respond (or activity stopped) → `activity:resultsReady` broadcasts results
6. Results display only after all participants have responded

### Participant Tracking
- Participants tracked via socket connections (in-memory Map), not database
- List updates in real-time when participants join/leave
- No "ghost" participants - disconnected users removed immediately

## Key Files

- `server/src/db/database.js` - Database queries (lowdb wrapper)
- `server/src/socket/handlers.js` - Socket.io event handlers, participant tracking
- `server/src/routes/sessions.js` - Session CRUD API
- `server/src/index.js` - Express server setup, CORS configuration
- `client/src/lib/config.js` - API URL configuration
- `client/src/pages/SessionManager.jsx` - Multi-session management UI
- `client/src/pages/PresenterDashboard.jsx` - Activity management, results display
- `client/src/pages/PresentationMode.jsx` - Full-screen presentation view
- `client/src/context/SessionContext.jsx` - Session state + API methods
- `vercel.json` - Vercel deployment configuration (at project root)
