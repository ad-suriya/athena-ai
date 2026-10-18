# Athena AI — Current Architecture (pre-Phase 1)

Recorded: 2026-10-09

---

## Frontend

**Entry point:** `client/src/main.jsx` → `client/src/App.jsx`

**Routing:** React Router v7 (`BrowserRouter`)

**Pages/routes:**

| Path | Component |
|------|-----------|
| `/login` | `pages/login/login.jsx` |
| `/chat` | `pages/chat/chat.jsx` |
| `/notes` | `pages/notes/notes.jsx` |
| `/notes/:id` | `pages/notes/NoteEditor.jsx` |
| `/tasks` | `pages/TaskManager/Task.jsx` |
| `/calendar` | `pages/calendar/Calendar.jsx` |
| `/profile` | `pages/profile/profile.jsx` |
| `/settings` | `pages/settings/settings.jsx` |
| `/code` | `pages/CodeEditor/CodeEditor.jsx` |
| `/mindmap` | `components/MindMapInterface.jsx` |

**Firebase client SDK usage (`client/src/firebase.js`):**

The client initialises both Firebase Auth and Firestore directly. This file exports:
- `auth`, `provider`, `signInWithPopup` — Firebase Auth
- `db` — Firestore instance
- Raw Firestore helpers: `doc`, `setDoc`, `getDoc`, `updateDoc`, `deleteDoc`, `collection`, `getDocs`, `query`, `orderBy`
- Application functions: `createNewConversation`, `addMessageToConversation`, `getUserConversations`, `getConversationMessages`

Files that directly call Firestore (should go through API in target architecture):

| File | Operation |
|------|-----------|
| `pages/login/login.jsx` | Creates/updates `users/{uid}` on Google sign-in |
| `pages/chat/hooks/useChatManager.jsx` | Reads/writes `users/{uid}/conversations` |
| `pages/chat/hooks/useChatHandlers.jsx` | Updates/deletes `users/{uid}/conversations/{id}` |
| `pages/chat/chat.jsx` | Imports Firestore helpers |
| `components/KnowledgeModal.jsx` | Uses `auth` and `db` |
| `components/EnhancedControlButton.jsx` | Uses `auth` for sign-out |

**API usage:**

`callChatAPI` in `pages/chat/utils/ChatUtils.jsx` sends POST to `/api/chat`.

The frontend also references `/api/search`, `/api/research`, and `/api/analyze` — these endpoints do not exist in the backend.

**localStorage usage:**

| File | Key(s) | Category |
|------|--------|----------|
| `App.jsx` | `isLoggedIn` | Auth state mirror |
| `pages/login/login.jsx` | `isLoggedIn` | Auth state mirror |
| `components/EnhancedControlButton.jsx` | `isLoggedIn` | Auth state mirror |
| `pages/notes/notes.jsx` | `notes` | **Persistent data** |
| `pages/TaskManager/OldTask.jsx` | `tasks`, `archivedTasks`, `subtasks`, `comments` | **Persistent data** |
| `pages/CodeEditor/CodeEditor.jsx` | `file_*` keys | Editor state |
| `components/CodeCompiler.jsx` | `pythonCode` | Editor state |
| `components/KnowledgeModal.jsx` | `knowledgeEntries` | **Persistent data** |
| `components/ReadAloudButton.jsx` | `preferredVoice` | UI preference (OK) |

**Active data flows:**

```
Chat:   React → firebase.js (Firestore) — conversation storage
        React → POST /api/chat → Vertex AI — AI response
Auth:   React → Firebase Auth (Google) — sign in
        React → firebase.js (Firestore) — user document
Notes:  React → localStorage — all note data
Tasks:  React → localStorage — all task data (OldTask.jsx)
```

---

## Backend

**Entry point:** `server/server.js`

**Middleware:** helmet, morgan, express-rate-limit, CORS, express.json

**Active endpoints:**

| Method | Path | Handler |
|--------|------|---------|
| POST | `/api/auth/google` | Verify Firebase ID token, return user record |
| POST | `/api/chat` | Vertex AI Gemini chat |
| GET | `/api/health` | Service health check |
| GET | `/api/minerva-status` | Returns `{ status: 'offline' }` stub |

**No CRUD endpoints exist** for tasks, notes, calendar, conversations, journal, or wellness.

**Firebase Admin:** initialized inline in `server.js`, used only for token verification in `/api/auth/google`.

**Vertex AI:** initialized inline in `server.js`. Model: `gemini-1.5-flash-001`.

**Environment variables used:**

```
PORT, NODE_ENV, ALLOWED_ORIGINS
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL
VERTEX_PROJECT_ID, VERTEX_LOCATION, GEMINI_MODEL, MAX_TOKENS, TEMPERATURE
```

---

## Data Storage (per feature)

| Feature | Current storage |
|---------|----------------|
| Conversations | Firestore `users/{uid}/conversations` via client SDK |
| Messages | Array field inside the conversation document (not a subcollection) |
| User profile | Firestore `users/{uid}` via client SDK on login |
| Tasks | localStorage (`OldTask.jsx`); `Task.jsx` status unknown |
| Notes | localStorage (`notes.jsx`) |
| Calendar | Unknown — needs inspection |
| Journal | Unknown — needs inspection |
| Wellness | Unknown — needs inspection |
| Knowledge | localStorage (`KnowledgeModal.jsx`) |
| Code files | localStorage (`CodeEditor.jsx`) |

---

## Minerva

No Minerva code is present in the repository. The backend has a stub endpoint `/api/minerva-status` that returns `{ status: 'offline' }`. This endpoint is retained for legacy/forward compatibility.

---

## Known Problems

1. **Direct Firestore access from the client** — `firebase.js` initialises Firestore in the browser. Target: all Firestore access goes through the backend API.
2. **Messages stored as an array** — `conversations/{uid}/conversations/{id}.messages` is an unbounded array. Target: subcollection `conversations/{id}/messages/{msgId}`.
3. **Client-side timestamps** — `new Date().toISOString()` used on messages. Target: `serverTimestamp()` via Firebase Admin.
4. **Notes/Tasks in localStorage** — data is not persisted to Firestore. Lost on browser clear.
5. **Auth state mirrored to localStorage** — `isLoggedIn` key is redundant given `auth.onAuthStateChanged`. Minor.
6. **Hardcoded admin credentials in `login.jsx`** — `CORRECT_EMAIL`, `CORRECT_PASSWORD` hardcoded in plain text. Must be addressed before production.
7. **Exposed service account JSON** — `client/public/athena-abafd-firebase-adminsdk-fbsvc-5d57a84f2e.json` was present in `client/public/`. This file should never be in a client directory. Confirm it is in `.gitignore` and not being served.
8. **Missing API endpoints** — frontend references `/api/search`, `/api/research`, `/api/analyze` which do not exist.
9. **No auth middleware** — backend has no route-level authentication enforcement. Any request to `/api/chat` is accepted without verifying the caller.
10. **Large components** — see `REFACTOR_PLAN.md` Phase 11.
11. **584 ESLint errors** — see `REFACTOR_PLAN.md` Phase 13.
