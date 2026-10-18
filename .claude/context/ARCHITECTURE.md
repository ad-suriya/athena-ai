# Athena AI - Architecture

## Current State

```
React (Vite)
 ├── Firebase client SDK (firebase.js) ← direct Firestore access from browser
 ├── localStorage (auth state, KnowledgeModal, CodeEditor, CodeCompiler, TaskManager/OldTask)
 └── Express API (chat + auth only)

Express (server/server.js)
 ├── Firebase Admin (auth token verification)
 └── Vertex AI (Gemini — /api/chat endpoint only)
```

The client SDK (`firebase.js`) currently:
- Initialises Firestore directly in the browser
- Reads/writes conversations (`users/{userId}/conversations`)
- Exports Firestore helpers used by chat hooks and pages

This is the primary architectural violation to fix.

---

## Target State

```
React (Vite)
 ↓
API service layer (client/src/services/)
 ↓
Express (server/)
 ↓
Controllers (server/controllers/)
 ↓
Services (server/services/)
 ├── Firestore (via Firebase Admin SDK)
 └── Vertex AI (Gemini)
```

Firebase client SDK on the frontend should be used for:
- Auth only (Google sign-in, onAuthStateChanged, ID token retrieval)

Everything else goes through the backend API.

---

## Minerva (Future / Disabled)

```
Minerva (Python — minerva/)
 ↓
Future AI service — NOT started with Athena dev server
 ↓
MINERVA_ENABLED=false
```

Do not delete. Do not integrate into the current refactor.

---

## Folder Structure

Implemented. See `docs/ARCHITECTURE.md` → "Backend Folder Structure" and
"Frontend Folder Structure" for the current layout and placement rules.

---

## Active API Endpoints (as of refactor start)

| Method | Path              | Purpose                        |
|--------|-------------------|--------------------------------|
| POST   | /api/auth/google  | Verify Firebase ID token       |
| POST   | /api/chat         | Chat via Vertex AI Gemini      |
| GET    | /api/health       | Service health check           |
| GET    | /api/minerva-status | Returns offline (stub)       |

All other CRUD endpoints (tasks, notes, calendar, conversations) are missing and must be added during the refactor.
