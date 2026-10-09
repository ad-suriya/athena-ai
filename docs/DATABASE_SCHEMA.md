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
  metadata:       map,       // optional — e.g. { isSearch, isDeepResearch, isCriticalAnalysis, legacyIndex }
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

## Relationship Model

```
User
 ├── Conversations (conversations/{id} where userId == user.uid)
 │      └── Messages (subcollection)
 ├── Tasks          (tasks/{id} where userId == user.uid)
 ├── Notes          (notes/{id} where userId == user.uid)
 ├── Journal Entries (journalEntries/{id} where userId == user.uid)
 ├── Calendar Events (calendarEvents/{id} where userId == user.uid)
 └── Wellness Entries (wellnessEntries/{id} where userId == user.uid)
```

Every user-owned document must carry a `userId` field.
Backend services must always filter by `userId === req.user.uid`.
