# Athena AI — Firestore Schema

This is the canonical schema. Do not invent fields or add collections without updating this file.

**Timestamp rule:** always use `serverTimestamp()` (Firebase Admin) for `createdAt` and `updatedAt`.
Never use `new Date()` or `Date.now()` from the client for persistent records.

---

## users

`users/{userId}`

```js
{
  id:           string,    // Firebase Auth UID
  email:        string,
  displayName:  string,
  photoURL:     string,
  timezone:     string,    // IANA tz, e.g. "America/New_York"
  memoryEnabled?: boolean, // conversation memory; missing = on (docs/CONVERSATION_MEMORY.md)
  createdAt:    timestamp,
  updatedAt:    timestamp,
}
```

Do not embed tasks, notes, messages, or other collections inside the user document.

---

## conversations

`conversations/{conversationId}`

```js
{
  id:           string,
  userId:       string,    // owner — index this field
  title:        string,    // first 30 chars of the first message, or set by rename
  createdAt:    timestamp,
  updatedAt:    timestamp,
  lastMessage:  string,    // preview of most recent message
  messageCount: number,
  archived:     boolean,   // default false
  isFavorite:   boolean,   // default false; missing on older docs means false
  legacyPath:   string,    // optional — set only on docs copied from users/{uid}/conversations/{id}
}
```

**Migration:** legacy data at `users/{uid}/conversations/{id}` is copied (never moved) by
`conversation.service.migrateLegacyConversations`. See `docs/DATA_MIGRATION.md`.

### Messages (subcollection)

`conversations/{conversationId}/messages/{messageId}`

```js
{
  id:             string,
  conversationId: string,
  role:           string,    // "user" | "assistant" | "system"
  content:        string,
  createdAt:      timestamp,
  model:          string,    // e.g. "gemini-2.5-flash"
  metadata:       map,       // optional:
                             //   search: true          — answered with Google Search (legacy: isSearch)
                             //   sources: [{ title, url }]   — web pages used (assistant, search only)
                             //   attachments: [{ name, mimeType, size }] — files sent to the AI (bytes are not stored)
                             //   rating: 'up' | 'down' — user's thumbs on an assistant reply
                             //   actions: [string]     — changes Athena made with tools (assistant)
                             //   editedAt, regenerated, legacyIndex, isDeepResearch, isCriticalAnalysis (legacy)
}
```

Messages copied from a legacy `messages[]` array use IDs `legacy-00000`, `legacy-00001`, …
and keep their original order via strictly increasing `createdAt`.

---

## tasks

`tasks/{taskId}`

```js
{
  id:          string,
  userId:      string,
  title:       string,
  description: string,
  status:      string,    // "todo" | "in_progress" | "completed" | "cancelled"
  priority:    string,    // "low" | "medium" | "high"
  dueDate:     timestamp,
  completedAt: timestamp,
  category:    string,
  tags:        string[],    // Task.jsx "Wellness Category" chips
  icon:        string,      // lucide icon name chosen in Task.jsx, e.g. "Heart"
  mindMapNodeId: number,    // optional: mind map node the task was planned from (set by
                            // Athena's planner only; cleared when that node is removed)
  createdAt:   timestamp,
  updatedAt:   timestamp,
}
```

---

## notes

`notes/{noteId}`

```js
{
  id:        string,
  userId:    string,
  title:     string,
  content:   string,    // TipTap JSON or HTML — do not change editor format during migration
  tags:      string[],
  color:     string,
  isPinned:  boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

Existing browser `localStorage['notes']` is not uploaded automatically (see `docs/DATA_MIGRATION.md`).

---

## conversationMemories

`conversationMemories/{conversationId}` — summaries for past-conversation search (server-only; see `docs/CONVERSATION_MEMORY.md`).
Derived from `conversations`; rebuilt with `server/scripts/index-memories.js`. Deleted when the conversation is deleted or the user turns memory off.

```js
{
  userId:         string,
  conversationId: string,
  title:          string,
  summary:        string,    // ≤ 120 words, written by Gemini
  messageCount:   number,    // conversation's messageCount when summarized
  lastMessageAt:  timestamp | null,
  embedding:      vector,    // EMBEDDING_DIMENSIONS (768) floats
  updatedAt:      timestamp,
}
```

Requires a composite vector index: `userId` ascending + `embedding` vector (768, flat).

---

## noteChunks

`noteChunks/{noteId}_{index}` — journal search passages (server-only; see `docs/JOURNAL_SEARCH.md`).
Derived from `notes`; safe to delete and rebuild with `server/scripts/index-journal.js`.

```js
{
  userId:    string,
  noteId:    string,
  index:     number,    // passage position in the entry
  title:     string,    // entry title at indexing time
  text:      string,    // plain-text passage (≤ 1500 chars)
  hash:      string,    // sha256 of title + text of the whole entry
  createdAt: timestamp | null, // the entry's createdAt
  embedding: vector,    // EMBEDDING_DIMENSIONS (768) floats
  updatedAt: timestamp,
}
```

Requires a composite vector index: `userId` ascending + `embedding` vector (768, flat).

---

## journalEntries

`journalEntries/{entryId}`

```js
{
  id:        string,
  userId:    string,
  title:     string,
  content:   string,
  mood:      string,
  tags:      string[],
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

Journal entries are separate from notes.

---

## calendarEvents

`calendarEvents/{eventId}`

```js
{
  id:          string,
  userId:      string,
  title:       string,
  description: string,
  startTime:   timestamp,    // always a Firestore timestamp — never a string like "Tomorrow"
  endTime:     timestamp,
  location:    string,
  color:       string,
  category:    string,
  allDay:      boolean,
  recurrence:  map,          // optional
  createdAt:   timestamp,
  updatedAt:   timestamp,
}
```

---

## wellnessEntries

`wellnessEntries/{entryId}`

```js
{
  id:         string,
  userId:     string,
  mood:       number,    // 1–10
  energy:     number,    // 1–10
  stress:     number,    // 1–10
  sleepHours: number,
  note:       string,
  recordedAt: timestamp,
  createdAt:  timestamp,
}
```

---

## mindMaps

`mindMaps/{userId}` — one map per user; the document ID is the user's UID.
Saved whole by `PUT /api/mindmap`.

`status`, `type` and `label` are optional; documents without them are valid and load
unchanged. A connection without a `type` is a parent → child link (the map's
hierarchy); typed connections are cross-links added from Athena's suggestions.
Task links live on the task (`tasks.mindMapNodeId`), not in this document, so plan
execution never races the client's auto-save of the whole map.

```js
{
  userId:      string,
  nodes:       [{ id: number, x: number, y: number, title: string, content: string,
                  type: 'main' | 'secondary' | 'note' | 'ai', expanded: boolean,
                  status?: 'idea' | 'planned' | 'in_progress' | 'blocked' | 'completed' }],  // max 500
  connections: [{ from: number, to: number,                                          // node ids, max 1000
                  type?: 'related' | 'dependency' | 'shared_goal' | 'blocker' | 'cause' | 'overlap',
                  label?: string }],                                                 // max 200 chars
  createdAt:   timestamp,
  updatedAt:   timestamp,
}
```

---

## feedback

`feedback/{id}` — "Send feedback" and Chat's "Report issue". Written by `POST /api/feedback`.

```js
{
  userId:    string,
  type:      'bug' | 'suggestion' | 'harmful' | 'inaccurate' | 'unhelpful' | 'other',
  message:   string,     // max 5000
  email:     string,     // optional reply address
  context:   { page?, conversationId?, messageId? },
  createdAt: timestamp,
}
```

---

## Relationship Model

```
User
 ├── Conversations (conversations/{id} where userId == user.uid)
 │      └── Messages (subcollection)
 ├── Tasks          (tasks/{id} where userId == user.uid)
 ├── Notes          (notes/{id} where userId == user.uid)
 ├── Journal Entries (journalEntries/{id} where userId == user.uid)
 ├── Calendar Events (calendarEvents/{id} where userId == user.uid)
 ├── Wellness Entries (wellnessEntries/{id} where userId == user.uid)
 ├── Mind Map       (mindMaps/{userId})
 └── Feedback       (feedback/{id} where userId == user.uid)
```

Every user-owned document must carry a `userId` field.
Backend services must always filter by `userId === req.user.uid`.
