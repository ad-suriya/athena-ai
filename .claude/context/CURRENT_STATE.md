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

Client reports 211 problems (all errors), after Phase 3. 184 of them are in
`features/conversations`, 15 in `features/calendar/components/CalendarTopBar.jsx`,
and the rest in `pages/` and `App.jsx`. `features/tasks`, `features/notes`,
`features/mindmap` and `components/sidebar` lint clean.

Major rules violated:

- `react/prop-types`
- `no-unused-vars`
- `react-hooks/exhaustive-deps`

Do not suppress these with eslint-disable comments. Fix them.

---

## Large Components

Phase 3 split the large components by responsibility. See `docs/COMPONENT_REFACTOR.md`.

| File | Before | After |
|------|--------|-------|
| `features/tasks/Task.jsx` | 1070 | 249 |
| `features/notes/components/DropdownMenu.jsx` | 881 | replaced by `NoteOptionsMenu.jsx` (249) + `NoteMenuItems.jsx` + `useDictation` |
| `features/notes/NoteEditor.jsx` | 749 | 143 |
| `features/mindmap/MindMapInterface.jsx` | 610 | 142 |
| `components/sidebar/Sidebar.jsx` | 597 | 171 |
| `features/calendar/Calendar.jsx` | 499 | 144 |
| `features/calendar/components/CalendarSidebar.jsx` | 527 | replaced by `CalendarMiniMonth`, `EventEditPanel`, `CalendarInfoPanel` |

`OldTask.jsx` and `sidebar1.jsx` are gone: `OldTask.jsx` is in `archive/`, and `sidebar1.jsx` was deleted in f88e74d.

---

## Data Problems

### Direct Firestore access from the client

Resolved in Phase 2. `client/src` no longer imports `firebase/firestore`.

### localStorage used for persistent data

Should be Firestore (via API) instead:

- `pages/TaskManager/OldTask.jsx` — all task data in localStorage
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
- Vertex AI Gemini is active (`gemini-2.5-flash`, project `athena-abafd`, `us-central1`) via the
  Google Gen AI SDK (`@google/genai`). The deprecated `@google-cloud/vertexai` and unused
  `@google/generative-ai` packages were removed.
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

- Firebase Admin service account JSON: moved from `client/public/` (where Vite would
  publish it) to `server/`, git-ignored. `server/.env` uses the `athena-abafd` project.
- The admin password formerly hardcoded in `Login.jsx` is removed (86228f9), but it
  remains in the public repository history; treat it as leaked.
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
