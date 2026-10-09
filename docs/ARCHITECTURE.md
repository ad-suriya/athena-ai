# Athena AI — Target Architecture

---

## Request / Data Flow

```
Browser (React + Vite)
         |
         | HTTPS (bearer token on protected routes)
         ↓
Node.js + Express
         |
         +──── Firebase Admin ──── Firestore
         |
         +──── Vertex AI (Gemini)
         |
         └──── Minerva
               FUTURE / DISABLED
```

---

## Layer Responsibilities

| Layer | Responsible for |
|-------|----------------|
| **React** | UI, local UI state, form state, rendering, calling API services |
| **Express** | Auth verification, authorization, input validation, business logic, Firestore ops, Vertex AI calls, error handling |
| **Firestore** | Persistent application data |
| **Vertex AI** | Active AI generation (Gemini) |
| **Minerva** | Future local AI — currently disabled |

---

## What React must NOT do

- Access Firestore directly (no Firebase client SDK Firestore calls)
- Call Vertex AI directly
- Store application data in localStorage (UI preferences only are acceptable)

---

## Backend Folder Structure

```
server/
├── package.json            start: node src/server.js
├── scripts/                One-off maintenance scripts (not part of the app)
│   └── migrate-conversations.js
└── src/
    ├── server.js           Entry point: load .env, start listening
    ├── app.js              Express app: security, parsing, CORS, /api routes, 404, errors
    │
    ├── config/             env.js (all process.env reads), firebase.js, vertex.js (singletons)
    ├── middleware/         auth.middleware.js (requireAuth → req.user),
    │                       error.middleware.js, rateLimit.middleware.js
    ├── routes/             Thin: middleware + controller wiring only
    │   ├── index.js        Mounts every router under /api
    │   ├── health.routes.js  /health, /minerva-status
    │   └── <feature>.routes.js
    ├── controllers/        <feature>.controller.js: validate input, call service, send response
    ├── services/           <feature>.service.js: business logic + Firestore; ai.service.js: Vertex AI
    └── utils/              errors, response, validate, asyncHandler, firestore (shared Firestore helpers)
```

Naming: `*.routes.js`, `*.controller.js`, `*.service.js`, `*.middleware.js`.

---

## Frontend Folder Structure

```
client/src/
├── main.jsx, App.jsx       Bootstrapping and routes
├── config/firebase.js      Firebase Auth only (no Firestore)
├── services/               HTTP API clients (api.js + one per resource). The only code that calls the backend.
├── components/layout/      App shell: AppShell (sidebar + top bar + <Outlet/>), search, account menu
├── features/               One folder per feature; feature code stays inside it
│   ├── home/               Home dashboard (landing page) + components/ hooks/ utils/
│   ├── conversations/      Chat.jsx + components/ (history/ drawer) hooks/ utils/ data/
│   ├── tasks/              Task.jsx + hooks/
│   ├── notes/              Notes.jsx, NoteEditor.jsx + components/ hooks/
│   ├── calendar/           Calendar.jsx + components/ hooks/ utils/
│   └── mindmap/            MindMapInterface.jsx
├── pages/                  Standalone pages that are not a feature:
│                           login/, profile/, settings/, feedback/
├── components/             UI shared by more than one feature (layout/; ui/ for primitives)
├── hooks/                  Hooks shared by more than one feature (useCurrentUser,
│                           useClickOutside, useVoiceRecording)
├── styles/                 Global stylesheets (index.css stays at src/ root)
└── assets/
```

Every signed-in route renders inside `AppShell` (see `App.jsx`); pages fill the main
area with `h-full`, not `h-screen`. Brand colors are Tailwind tokens (`brand-*`, `ink`,
`line`, `canvas`) in `tailwind.config.js`.

Rules: a component used by one feature lives in that feature. Move it to `components/`
only when a second feature needs it. Folders are lowercase/kebab-case, and component
files are PascalCase. Unused legacy code lives in the repository-level `archive/`.

---

## API Response Standard

Success:

```json
{ "success": true, "data": {} }
```

List:

```json
{ "success": true, "data": [], "meta": { "page": 1, "limit": 20, "total": 42 } }
```

Error:

```json
{ "success": false, "error": { "code": "TASK_NOT_FOUND", "message": "Task not found" } }
```

Validation:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "title": "..." } } }
```

**Note:** Existing `/api/chat` and `/api/auth/google` currently return legacy formats.
These will be updated as each phase migrates the corresponding frontend service.

---

## Authorization Rule

Every route that touches user data must use the `requireAuth` middleware.
The middleware verifies the Firebase ID token and sets `req.user.uid`.
Services must filter Firestore queries by `userId === req.user.uid`.

---

## Environment Configuration

All environment variable reads go through `server/config/env.js`.
No `process.env.*` calls outside of `env.js` and `dotenv` initialization.

---

## Athena's actions (AI tools)

In Chat, Athena can change the user's data: tasks, journal entries, calendar
events, mood check-ins and the mind map. It uses Gemini function calling.

```
POST /api/conversations/:id/messages
  → conversation.service.sendMessage
  → ai.service.generateResponse (tool loop, max 8 rounds)
  → agent/tools.js  — validates args with the REST controllers' specs
  → task / note / calendar / wellness / mindmap services (same as the API)
```

- Tools run as the signed-in user (`req.user.uid`); they can only reach that user's data.
- Changes happen immediately, including deletes (product decision: fully automatic).
- Each change adds a line to the reply's `metadata.actions`; Chat shows them under the reply,
  and later turns see them so the model knows what it did.
- If a reply claims a change but no tool ran, the server tells the model once and makes it act
  or correct itself.
- Web search turns tools off for that message (Gemini cannot combine them).
- Regenerate never runs tools, so it cannot repeat a change.
- Vertex 429 (quota) is retried with backoff; if it still fails after some changes were made,
  the reply lists those changes instead of failing.
- The client sends its IANA time zone so "tomorrow at 6pm" means the user's local time.

## Minerva

Minerva is retained for future use. It has no active code in the repository.

The `/api/minerva-status` endpoint returns:

```json
{ "success": true, "data": { "service": "minerva", "enabled": false, "status": "disabled" } }
```

`MINERVA_ENABLED=false` must remain in `.env`.
