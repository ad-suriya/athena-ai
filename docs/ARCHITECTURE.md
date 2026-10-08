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
├── server.js             Express app wiring — middleware, routes, startup
├── package.json
│
├── config/
│   ├── env.js            All process.env reads, config object exported
│   ├── firebase.js       Firebase Admin + Firestore init (singleton)
│   └── vertex.js         Vertex AI init (singleton)
│
├── middleware/
│   ├── auth.js           requireAuth — verifies Firebase ID token → req.user
│   ├── errorHandler.js   Express error handler (last middleware)
│   └── validate.js       (future) request body validation helper
│
├── routes/               Thin — just mount controllers
│   ├── auth.js
│   ├── chat.js
│   ├── conversations.js  (Phase 9)
│   ├── tasks.js          (Phase 5)
│   ├── notes.js          (Phase 6)
│   ├── calendar.js       (Phase 7)
│   ├── journal.js        (Phase 8)
│   └── wellness.js       (Phase 8)
│
├── controllers/          Coordinate request/response, call services
│   ├── authController.js
│   ├── chatController.js
│   └── ...
│
├── services/             Business logic + data operations
│   ├── chatService.js    Vertex AI chat
│   ├── userService.js    (future)
│   ├── conversationsService.js (Phase 9)
│   ├── tasksService.js   (Phase 5)
│   └── ...
│
└── utils/
    └── response.js       Standard JSON response helpers
```

---

## Frontend Folder Structure

```
client/src/
├── pages/               Page-level components
│   ├── chat/
│   ├── notes/
│   ├── TaskManager/
│   ├── calendar/
│   └── ...
│
├── components/          Shared UI components
├── hooks/               Shared hooks
│
├── services/            HTTP API clients — NO Firestore calls here
│   ├── api.js           Base fetch wrapper (injects auth token)
│   ├── conversationsService.js  (Phase 9)
│   ├── tasksService.js          (Phase 5)
│   ├── notesService.js          (Phase 6)
│   ├── calendarService.js       (Phase 7)
│   ├── journalService.js        (Phase 8)
│   └── wellnessService.js       (Phase 8)
│
├── utils/
├── firebase.js          Firebase Auth only (no Firestore imports)
└── App.jsx
```

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

## Minerva

Minerva is retained for future use. It has no active code in the repository.

The `/api/minerva-status` endpoint returns:

```json
{ "success": true, "data": { "service": "minerva", "enabled": false, "status": "disabled" } }
```

`MINERVA_ENABLED=false` must remain in `.env`.
