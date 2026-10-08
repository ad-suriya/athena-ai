# Athena Firestore Schema

This is the canonical schema. Do not invent fields or collections not listed here.
If a new field is needed, add it here first.

---

## users

`users/{userId}`

| Field        | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| id           | string    | Firebase Auth UID              |
| email        | string    |                                |
| displayName  | string    |                                |
| photoURL     | string    |                                |
| timezone     | string    | e.g. "America/New_York"        |
| createdAt    | timestamp |                                |
| updatedAt    | timestamp |                                |

---

## conversations

**Current structure (to migrate):** `users/{userId}/conversations/{conversationId}`

**Target structure:** `conversations/{conversationId}` with `userId` as a field

| Field        | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| id           | string    |                                |
| userId       | string    | owner                          |
| title        | string    | first 30 chars of first message |
| createdAt    | timestamp |                                |
| updatedAt    | timestamp |                                |
| lastMessage  | string    |                                |
| messageCount | number    |                                |
| archived     | boolean   | default false                  |

### Messages (subcollection)

`conversations/{conversationId}/messages/{messageId}`

| Field          | Type      | Notes                          |
|----------------|-----------|--------------------------------|
| id             | string    |                                |
| conversationId | string    |                                |
| role           | string    | "user" or "assistant"          |
| content        | string    |                                |
| createdAt      | timestamp | use serverTimestamp, not client Date |
| model          | string    | e.g. "gemini-1.5-flash-001"    |
| metadata       | map       | optional                       |

**Current problem:** messages are stored as an array inside the conversation document,
not as a subcollection. Migration needed in Phase 9.

---

## tasks

`tasks/{taskId}`

| Field       | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | string    |                                |
| userId      | string    |                                |
| title       | string    |                                |
| description | string    |                                |
| status      | string    | "todo" / "in-progress" / "done"|
| priority    | string    | "low" / "medium" / "high"      |
| dueDate     | timestamp |                                |
| tags        | array     |                                |
| createdAt   | timestamp |                                |
| updatedAt   | timestamp |                                |

**Current problem:** Task.jsx uses localStorage. Must migrate to Firestore via API.

---

## notes

`notes/{noteId}`

| Field       | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | string    |                                |
| userId      | string    |                                |
| title       | string    |                                |
| content     | string    | rich text / markdown           |
| tags        | array     |                                |
| pinned      | boolean   |                                |
| archived    | boolean   |                                |
| createdAt   | timestamp |                                |
| updatedAt   | timestamp |                                |

**Current problem:** Notes currently use frontend/local persistence. Must migrate to Firestore via API.

---

## calendarEvents

`calendarEvents/{eventId}`

| Field       | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | string    |                                |
| userId      | string    |                                |
| title       | string    |                                |
| description | string    |                                |
| startTime   | timestamp |                                |
| endTime     | timestamp |                                |
| allDay      | boolean   |                                |
| color       | string    |                                |
| recurrence  | map       | optional                       |
| createdAt   | timestamp |                                |
| updatedAt   | timestamp |                                |

---

## journalEntries

`journalEntries/{entryId}`

| Field       | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | string    |                                |
| userId      | string    |                                |
| content     | string    |                                |
| mood        | string    |                                |
| tags        | array     |                                |
| createdAt   | timestamp |                                |
| updatedAt   | timestamp |                                |

---

## wellnessEntries

`wellnessEntries/{entryId}`

| Field       | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | string    |                                |
| userId      | string    |                                |
| type        | string    | e.g. "sleep", "mood", "exercise"|
| value       | number    |                                |
| notes       | string    |                                |
| recordedAt  | timestamp |                                |
| createdAt   | timestamp |                                |

---

## Timestamp Rule

Always use `serverTimestamp()` (Firebase Admin) for `createdAt` and `updatedAt`.
Never use `new Date().toISOString()` from the client for persistent records.
Client-side `Date` timestamps are only acceptable for optimistic UI before a server write confirms.
