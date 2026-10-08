# Current Repository State

Last verified: 2026-10-09

---

## What Works

- React/Vite client builds and runs
- Google Sign-In via Firebase Auth
- Chat via Vertex AI Gemini (`/api/chat`)
- Firebase Auth token verification (`/api/auth/google`)
- All application data (tasks, notes, calendar, journal, wellness, conversations,
  messages, user profile) goes React → service → Express → Firestore.
  `client/src/firebase.js` is Firebase Auth only. See `docs/DATA_MIGRATION.md`.
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

Resolved in Phase 2. `client/src` no longer imports `firebase/firestore`.

### localStorage used for persistent data

Should be Firestore (via API) instead:

- `pages/TaskManager/OldTask.jsx` — all task data in localStorage
- `pages/CodeEditor/CodeEditor.jsx` — code files in localStorage
- `components/KnowledgeModal.jsx` — knowledge entries in localStorage

Acceptable localStorage uses (UI preferences, not data):
- `ReadAloudButton.jsx` — preferred voice
- `App.jsx` — `isLoggedIn` flag (to remove; use auth state directly)

### Conversations / messages

Resolved in Phase 2: `conversations/{id}` + `messages` subcollection with server timestamps.
Legacy `users/{uid}/conversations` docs are copied, not modified (see `docs/DATA_MIGRATION.md`).

---

## Backend

- Node/Express server is active and deployed
- Vertex AI Gemini is active (`gemini-1.5-flash-001`)
- CRUD routes: `/api/tasks`, `/api/notes`, `/api/calendar/events`, `/api/journal`,
  `/api/wellness`, `/api/conversations` (+ `/:id/messages`), `/api/users/me`
- All data routes use `requireAuth`; ownership is checked in services (404 if not owned)
- `/api/chat` is legacy (no client caller) and requires auth
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
