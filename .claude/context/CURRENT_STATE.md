# Current Repository State

Last verified: 2026-10-09

---

## What Works

- React/Vite client builds and runs
- Google Sign-In via Firebase Auth
- Chat via Vertex AI Gemini (`/api/chat`)
- Firebase Auth token verification (`/api/auth/google`)
- Conversation history saves to Firestore (via client SDK — violation to fix)
- Server has helmet, rate limiting, morgan, CORS configured correctly

---

## ESLint

Client currently reports approximately:

- 584 problems
- 575 errors
- 9 warnings

Major rules violated:

- `react/prop-types`
- `no-unused-vars`
- `react-hooks/exhaustive-deps`

Do not suppress these with eslint-disable comments. Fix them.

---

## Large Components

| File | Lines | Notes |
|------|-------|-------|
| `pages/TaskManager/OldTask.jsx` | ~2112 | Legacy — may be dead code |
| `pages/TaskManager/Task.jsx` | ~1127 | Active task manager |
| `pages/notes/DropdownMenu.jsx` | ~875 | |
| `pages/notes/NoteEditor.jsx` | ~748 | |
| `components/MindMapInterface.jsx` | ~610 | |
| `components/SideBar.jsx` | ~597 | |
| `pages/calendar/Calendar.jsx` | ~550 | |

---

## Data Problems

### Direct Firestore access from the client

`client/src/firebase.js` initialises Firestore and exports Firestore helpers.

Files that use these helpers directly (instead of going through the API):

- `App.jsx` — uses `auth` (OK), also sets `localStorage.setItem('isLoggedIn')`
- `pages/chat/hooks/useChatManager.jsx` — reads/writes conversations via firebase.js
- `pages/chat/hooks/useChatHandlers.jsx` — reads/writes conversations via firebase.js
- `pages/login/login.jsx` — Firebase Auth (OK)
- `pages/notes/notes.jsx` — may read from firebase.js
- `components/KnowledgeModal.jsx` — uses Firestore helpers
- `components/EnhancedControlButton.jsx` — uses Firestore helpers
- `components/ReadAloudButton.jsx` — uses Firestore helpers
- `components/CodeCompiler.jsx` — uses localStorage
- `pages/CodeEditor/CodeEditor.jsx` — uses localStorage

### localStorage used for persistent data

Should be Firestore (via API) instead:

- `pages/TaskManager/OldTask.jsx` — all task data in localStorage
- `pages/TaskManager/Task.jsx` — confirm if still uses localStorage
- `pages/CodeEditor/CodeEditor.jsx` — code files in localStorage
- `components/KnowledgeModal.jsx` — knowledge entries in localStorage

Acceptable localStorage uses (UI preferences, not data):
- `ReadAloudButton.jsx` — preferred voice
- `App.jsx` — `isLoggedIn` flag (to remove; use auth state directly)

### Messages stored as array in conversation document

Current: `conversations/{conversationId}.messages = [{...}, {...}]`

This does not scale and prevents proper pagination.

Target: `conversations/{conversationId}/messages/{messageId}` subcollection.

### Client timestamps on messages

`firebase.js` uses `new Date().toISOString()` for message timestamps.
Should use `serverTimestamp()` via Firebase Admin on the backend.

---

## Backend

- Node/Express server is active and deployed
- Vertex AI Gemini is active (`gemini-1.5-flash-001`)
- Only two functional routes: `/api/chat` and `/api/auth/google`
- No CRUD routes exist yet for tasks, notes, calendar, conversations
- No middleware for auth on protected routes yet
- Python Minerva exists at `minerva/` but is DISABLED — do not delete

---

## Styling

- Tailwind CSS is configured
- Component-specific CSS files exist throughout `pages/` — these should be migrated to Tailwind
- `components/theme.css` and `src/index.css` are global — keep these

---

## Security Issues

- Firebase Admin service account JSON (`athena-abafd-firebase-adminsdk-fbsvc-5d57a84f2e.json`)
  is inside `client/public/` — this is a critical secret exposure. Verify it is not being served.
  It should never be in the client directory.
- `.env` files exist in both `client/` and `server/` — confirm they are in `.gitignore`

---

## Files to Inspect Per Phase

### Phase 1 (Backend Foundation)
```
server/server.js
server/package.json
server/.env.example
```

### Phase 3 (API Layer)
```
client/src/firebase.js
client/src/pages/chat/hooks/useChatManager.jsx
client/src/pages/chat/hooks/useChatHandlers.jsx
```

### Phase 5 (Tasks)
```
client/src/pages/TaskManager/Task.jsx
client/src/pages/TaskManager/TaskManager.jsx
client/src/pages/TaskManager/OldTask.jsx
```

### Phase 6 (Notes)
```
client/src/pages/notes/notes.jsx
client/src/pages/notes/NoteEditor.jsx
client/src/pages/notes/DropdownMenu.jsx
```

### Phase 7 (Calendar)
```
client/src/pages/calendar/Calendar.jsx
client/src/pages/calendar/CalendarSidebar.jsx
client/src/pages/calendar/CalendarTopBar.jsx
```
