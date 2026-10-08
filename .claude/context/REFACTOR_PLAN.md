# Refactor Plan

Complete one phase at a time. Do not jump ahead.
Verify with `npm run lint && npm run build` before moving to the next phase.

---

## Phase 0 — Freeze

- [ ] Tag current working state in git
- [ ] Confirm app runs locally end-to-end before touching anything

---

## Phase 1 — Backend Foundation

Goal: establish the Route → Controller → Service pattern in the backend.

- [ ] Create `server/middleware/authMiddleware.js` (verify Firebase ID token)
- [ ] Refactor `server/server.js` to mount routes from `server/routes/`
- [ ] Create `server/services/firebaseService.js` (Firestore init, shared helpers)
- [ ] Create `server/services/chatService.js` (extract Vertex AI logic from server.js)
- [ ] Create `server/routes/chat.js` + `server/controllers/chatController.js`
- [ ] Create `server/routes/auth.js` + `server/controllers/authController.js`
- [ ] Verify: existing `/api/chat` and `/api/auth/google` still work

---

## Phase 2 — Firestore Schema Alignment

Goal: confirm live Firestore data matches the canonical schema in DATABASE_SCHEMA.md.

- [ ] Audit existing Firestore documents
- [ ] Document any deviations
- [ ] Do NOT migrate data yet — just document

---

## Phase 3 — API Layer (Frontend Service)

Goal: create a typed API service layer in the frontend so components stop calling firebase.js directly.

- [ ] Create `client/src/services/api.js` (base fetch wrapper with auth token injection)
- [ ] Reduce `client/src/firebase.js` to auth-only exports
- [ ] Create `client/src/services/conversationsService.js`
- [ ] Verify chat still works end-to-end

---

## Phase 4 — Authentication Boundary

Goal: ensure all protected API routes verify the Firebase ID token server-side.

- [ ] Apply `authMiddleware` to all non-public routes
- [ ] Frontend sends ID token in Authorization header
- [ ] Remove `localStorage.setItem('isLoggedIn', ...)` — use `auth.onAuthStateChanged` as single source of truth
- [ ] Verify login/logout flow

---

## Phase 5 — Tasks Migration

Goal: move Task data from localStorage to Firestore via API.

- [ ] Create `server/routes/tasks.js` + controller + service
- [ ] Create `client/src/services/tasksService.js`
- [ ] Refactor `Task.jsx` to use tasksService (remove localStorage)
- [ ] Verify task CRUD works

---

## Phase 6 — Notes Migration

Goal: move Notes data from local/frontend persistence to Firestore via API.

- [ ] Create `server/routes/notes.js` + controller + service
- [ ] Create `client/src/services/notesService.js`
- [ ] Refactor `notes.jsx`, `NoteEditor.jsx`, `DropdownMenu.jsx` to use notesService
- [ ] Verify notes CRUD works

---

## Phase 7 — Calendar Migration

Goal: move Calendar events to Firestore via API.

- [ ] Create `server/routes/calendar.js` + controller + service
- [ ] Create `client/src/services/calendarService.js`
- [ ] Refactor `Calendar.jsx` to use calendarService
- [ ] Verify calendar CRUD works

---

## Phase 8 — Journal + Wellness Migration

Goal: move journal and wellness data to Firestore via API.

- [ ] Create routes + controllers + services for both
- [ ] Refactor relevant components
- [ ] Verify data saves correctly

---

## Phase 9 — Conversation Migration

Goal: migrate conversations from `users/{userId}/conversations` array-messages pattern
to `conversations/{conversationId}` with messages subcollection.

- [ ] Create `server/routes/conversations.js` + controller + service
- [ ] Migrate conversation writes in `useChatHandlers.jsx` and `useChatManager.jsx`
- [ ] Confirm messages use serverTimestamp
- [ ] Verify full chat history persists across sessions

---

## Phase 10 — Dynamic / Hardcoded Data

Goal: replace any remaining hardcoded data with dynamic Firestore reads.

- [ ] Audit for hardcoded values in components
- [ ] Replace with API calls where appropriate

---

## Phase 11 — Split Large Components

Goal: split by responsibility, not line count.

Priority order (largest first):
- `TaskManager/OldTask.jsx` (~2112 lines) — archive or delete if superseded by Task.jsx
- `TaskManager/Task.jsx` (~1127 lines)
- `notes/DropdownMenu.jsx` (~875 lines)
- `notes/NoteEditor.jsx` (~748 lines)
- `components/SideBar.jsx` (~597 lines)
- `components/MindMapInterface.jsx` (~610 lines)
- `calendar/Calendar.jsx` (~550 lines)

---

## Phase 12 — Tailwind Cleanup

Goal: remove component-specific CSS files where Tailwind can replace them.

- [ ] Audit `.css` files in `pages/` and `components/`
- [ ] Migrate styles to Tailwind classes where sensible
- [ ] Keep `index.css` and `theme.css` for global tokens

---

## Phase 13 — ESLint

Goal: resolve ESLint errors systematically, not by suppression.

Current count: ~584 problems (575 errors, 9 warnings).
Major rules: `react/prop-types`, `no-unused-vars`, `react-hooks/exhaustive-deps`

- [ ] Fix `no-unused-vars` (delete dead code)
- [ ] Fix `react/prop-types` (add PropTypes or migrate to TypeScript types)
- [ ] Fix `react-hooks/exhaustive-deps` (fix actual dependency issues, do not disable rules)
- [ ] Run `npm run lint` until clean

---

## Phase 14 — Documentation

- [ ] Update README.md
- [ ] Document API endpoints
- [ ] Update `.env.example` files

---

## Phase 15 — Testing

- [ ] Add integration tests for API endpoints
- [ ] Add smoke tests for critical UI flows

---

## Phase 16 — Final Cleanup

- [ ] Remove `OldTask.jsx` if Task.jsx fully replaces it
- [ ] Remove dead imports
- [ ] Final lint + build
