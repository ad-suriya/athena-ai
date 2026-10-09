# Athena AI — Phase 2 Data Migration

Audit date: 2026-10-09. Every row below was verified against the repository
(`grep` for `getDoc|getDocs|setDoc|addDoc|updateDoc|deleteDoc|onSnapshot|collection|doc|localStorage|sessionStorage|fetch|axios|firebase`)
and, for conversations, against the live Firestore project (read-only document counts).

---

## 1. Audit — state before Phase 2

| Feature        | Current Storage                                         | Current Access                                                                 | Target API                          |
|----------------|---------------------------------------------------------|--------------------------------------------------------------------------------|-------------------------------------|
| Tasks          | **None** — React state seeded with 6 hardcoded demo tasks; lost on refresh | `pages/TaskManager/Task.jsx` `useState([...])`                    | `/api/tasks`                        |
| Notes          | `localStorage['notes']` (array of `{id,title,content(HTML),createdAt,updatedAt}`) | `pages/notes/notes.jsx` reads/writes localStorage directly    | `/api/notes`                        |
| Calendar       | **None** — React state seeded with 5 hardcoded demo events; lost on refresh | `pages/calendar/Calendar.jsx` `useState([...])`; `UpcomingEvents.jsx` local empty state | `/api/calendar/events`   |
| Journal        | **No feature exists.** The Notes page labels notes "New journal"; there is no separate journal UI or data | —                                         | `/api/journal`                      |
| Wellness       | **No feature exists.** `Task.jsx` is titled "Wellness Tracker" but stores tasks; no mood/energy/sleep data anywhere | —                                  | `/api/wellness`                     |
| Conversations  | Firestore `users/{uid}/conversations/{id}` (client SDK) | `firebase.js` helpers + raw `doc/getDoc/updateDoc/deleteDoc` in `useChatManager.jsx`, `useChatHandlers.jsx`, `chat.jsx` | `/api/conversations`  |
| Messages       | Array field `messages[]` on the conversation doc, client ISO timestamps (`arrayUnion`) | `firebase.js` `createNewConversation`, `addMessageToConversation`; whole-array rewrites on edit/regenerate in `useChatManager.jsx` | `/api/conversations/:id/messages` |
| AI (Gemini)    | —                                                       | Client calls `POST /api/chat` **without auth**, sending full history; also calls `/api/search`, `/api/research`, `/api/analyze`, which do not exist on the server (404) | Backend only, via messages endpoint |
| Users          | Firestore `users/{uid}`                                 | `pages/login/login.jsx` `getDoc/setDoc/updateDoc` from the client              | `POST /api/auth/google` (upsert)    |

### Other client-side storage found (not in Phase 2 scope)

| Location                            | Key / data                      | Classification |
|-------------------------------------|---------------------------------|----------------|
| `App.jsx`, `login.jsx`, `EnhancedControlButton.jsx` | `isLoggedIn` flag | Auth UI flag — Phase 4 (auth boundary) |
| `components/ReadAloudButton.jsx`    | `preferredVoice`                | UI preference — acceptable |
| `components/KnowledgeModal.jsx`     | `knowledgeEntries`              | User data — later phase |
| `pages/CodeEditor/CodeEditor.jsx`   | code files                      | Feature removed (archived) |
| `components/CodeCompiler.jsx`       | `pythonCode`                    | User data — later phase |
| `pages/TaskManager/OldTask.jsx`, `TaskManager.jsx` | `tasks`, `archivedTasks`, ... | Dead code — not imported anywhere |
| `pages/settings/settings.jsx`       | "Engagement Dashboard" heatmap  | Mock data generated in the component (today = 1 login, every other day = 0) |

### Live Firestore inventory (read-only, counts only)

> **Project mismatch found during the audit.** `server/.env` pointed at Firebase project
> `yudle-ai`, while `client/.env` (Auth + client Firestore) uses `athena-abafd`.
> ID tokens from one project cannot be verified by the other, so the API returns 401
> until both point to the same project. `athena-abafd` is the canonical Athena project.
> The counts below were taken from **`yudle-ai`**. The `athena-abafd` inventory has
> **not** been taken yet; see section 4 (open blockers). The migration design below
> holds for either project.

| Collection                                   | Documents |
|----------------------------------------------|-----------|
| `users`                                      | 17        |
| `users/{uid}/conversations` (13 users)       | 526       |
| messages inside those `messages[]` arrays    | 1,591 (max 40 per conversation) |
| `tasks`, `notes`, `calendarEvents`, `journalEntries`, `wellnessEntries`, `conversations` | do not exist |

Legacy conversation fields: `title`, `messages`, `createdAt`, `updatedAt`, `archived`.
Legacy message fields: `role`, `content`, `timestamp` (client ISO string).

---

## 2. Decisions

### Tasks, Notes, Calendar
No server-side data exists, so there is nothing to migrate in Firestore.

- **Hardcoded demo tasks and calendar events are removed as the source of truth.**
  New users start with an empty list and see the existing empty states.
  The demo data is *not* written to anyone's account.
- **Notes in `localStorage` are not uploaded automatically.** Notes are per-browser
  today and the old key is not tied to a user, so silently uploading them could
  attach one person's notes to another account on a shared machine.
  The `notes` key is left untouched in the browser (not deleted).
- Static UI configuration stays in code: task status options, wellness categories,
  icons, "Athena AI Suggestions", calendar colours.

### UI ↔ schema mapping (done in the client feature hooks, not in components)

| UI field (Task.jsx)            | Firestore field (`tasks`)                     |
|--------------------------------|-----------------------------------------------|
| `status` "To Do" / "In progress" / "Done" | `status` `todo` / `in_progress` / `completed` |
| `completed` (derived)          | derived from `status === 'completed'`; `completedAt` set by server |
| `category[]`                   | `tags[]`                                      |
| `notes`                        | `description`                                 |
| `icon`                         | `icon` (added to schema)                      |

| UI field (Calendar)            | Firestore field (`calendarEvents`)            |
|--------------------------------|-----------------------------------------------|
| `date` "YYYY-MM-DD" + `time` "3:30 PM - 4:00 PM" | `startTime`, `endTime` (timestamps, computed in the user's local timezone) |
| `type`                         | `category`                                    |
| `color`, `description`, `title`| same                                          |

### Journal and Wellness
There is no Journal or Wellness UI in the client today. Phase 2 adds the
backend API and client services (`journalService`, `wellnessService`) so a UI can
be built on them, but **no screen consumes them yet**. Building those screens is
new feature work, not a migration.

### Conversations — migration required

Real data exists, so the old structure is **not modified or deleted** by the migration.

Strategy: **copy, never move; idempotent; lazy plus an optional bulk script.**

1. `conversation.service.migrateLegacyConversations(userId)` copies every
   `users/{uid}/conversations/{id}` that does not yet exist at `conversations/{id}`:
   - conversation doc → `conversations/{id}` with `userId`, `title`, `createdAt`,
     `updatedAt`, `archived`, `lastMessage`, `messageCount`, `legacyPath`
   - each array element → `conversations/{id}/messages/{legacy-00000…}` with
     `createdAt` from the legacy ISO `timestamp` (forced strictly increasing so the
     original order is preserved), `model`, `metadata.legacyIndex`
   - one batched write per conversation (≤ 41 writes), using `create()` so a
     conversation that already exists is never overwritten
2. `GET /api/conversations` runs this once per user per server process, so every
   user's history appears without any manual step.
3. `server/scripts/migrate-conversations.js` runs the same function for all users.
   It is **dry-run by default**; pass `--apply` to write.
4. The same conversation ID is kept, so URLs and IDs stay stable.
5. Deleting a conversation through the API deletes the new copy **and** the
   legacy source doc. Otherwise the lazy migration would bring it back. This matches
   the old behaviour, which deleted the legacy doc.

Rollback: revert the frontend commits. The legacy data is untouched, so the old
client keeps working. Messages sent through the new API while it was live will
only exist in the new structure.

Cleanup of `users/{uid}/conversations` is **deferred** until the migration has been
verified in production. It needs an explicit decision and is not part of Phase 2.

---

## 3. Target state (after Phase 2)

| Feature        | Storage                                             | Access                                      | API |
|----------------|-----------------------------------------------------|---------------------------------------------|-----|
| Tasks          | `tasks/{id}`                                        | `Task.jsx` → `useTasks` → `taskService`     | `/api/tasks` |
| Notes          | `notes/{id}`                                        | `notes.jsx` → `useNotes` → `noteService`    | `/api/notes` |
| Calendar       | `calendarEvents/{id}`                               | `Calendar.jsx`, `UpcomingEvents.jsx` → `useCalendarEvents` → `calendarService` | `/api/calendar/events` |
| Journal        | `journalEntries/{id}`                               | `journalService` (no UI yet)                | `/api/journal` |
| Wellness       | `wellnessEntries/{id}`                              | `wellnessService` (no UI yet)               | `/api/wellness` |
| Conversations  | `conversations/{id}` (`userId` field)               | `useChatManager` → `conversationService`    | `/api/conversations` |
| Messages       | `conversations/{id}/messages/{messageId}`           | `useChatManager` → `conversationService`    | `/api/conversations/:id/messages` |
| AI             | —                                                   | backend `ai.service.js` only                | via messages endpoint |
| Users          | `users/{uid}`                                       | `login.jsx` → `authService`                 | `POST /api/auth/google` |

Queries filter only on `userId` (single-field equality) and sort in the service,
so **no composite Firestore indexes are required**.

### Firestore security rules (action required, outside this repo)
There is no `firestore.rules` in the repository. The old client wrote to
`users/{uid}/conversations` directly, so the deployed rules must allow client
writes there. Once the new frontend is deployed, tighten the rules to deny all
client reads and writes to application data (the Admin SDK bypasses rules).

---

## 4. Status (2026-10-09)

### Done (one commit per step)

| Commit message                               | What changed |
|----------------------------------------------|--------------|
| `refactor: add task api layer` / `migrate tasks to backend` | `/api/tasks`, `useTasks`, demo tasks removed |
| `refactor: add notes api layer` / `migrate notes to firestore` | `/api/notes`, `useNotes` |
| `refactor: add calendar api layer` / `migrate calendar to backend` | `/api/calendar/events`, `useCalendarEvents`, demo events removed |
| `refactor: migrate journal data`             | `/api/journal`, `journalService` (no UI) |
| `refactor: migrate wellness data`            | `/api/wellness`, `wellnessService` (no UI) |
| `refactor: establish conversation api`       | `/api/conversations` + messages, legacy copy, `ai.service.js` |
| `refactor: migrate messages to backend`      | chat hooks use `conversationService`; sidebar rename/delete wired up |
| `refactor: remove migrated firestore access` | `firebase.js` is Auth-only; user upsert moved to backend; `/api/chat` requires auth |
| `refactor: replace static dashboard data`    | Profile page: real name/email/join date/last active/chat count via `GET /api/users/me` |

`client/src` no longer imports `firebase/firestore`.

### Hardcoded data: what stays

- **There is no dashboard page.** The only hardcoded user statistics were on the
  Profile page (now real).
- **Settings → Engagement heatmap** is still generated in the component
  (today = 1 login, other days = 0). Per-day login history is not recorded anywhere,
  so it cannot be made real without new data collection. That is new feature work.
- The Profile page subtitle "Administrator" is static text. There are no roles.

### Open blockers for end-to-end verification

1. **Firebase project mismatch.** `server/.env` uses `yudle-ai` and the client uses
   `athena-abafd`. Until the server uses `athena-abafd` Admin credentials, every
   authenticated API call returns 401. Google sign-in still works because profile sync
   at login is non-blocking.
2. **Vertex AI not configured.** `VERTEX_PROJECT_ID` / `VERTEX_LOCATION` are missing
   from `server/.env`, so message sends return `503 AI_UNAVAILABLE`.
   The user message is still saved.
3. After (1), run `node server/scripts/migrate-conversations.js` (dry run) against
   `athena-abafd` to inventory legacy conversations before anyone uses the new client.

