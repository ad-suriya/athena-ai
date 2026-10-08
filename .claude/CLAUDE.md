# Athena AI - Engineering Rules

## Project Goal

Refactor Athena AI without breaking existing functionality.

This is a refactor, NOT a rewrite.

## Architecture

Target architecture:

```
React/Vite
    ↓
Node/Express API
    ↓
Firebase Admin / Firestore
    ↓
Vertex AI (Gemini)
```

Minerva is a future AI service and must remain in the repository,
but it is currently disabled.

MINERVA_ENABLED=false

Do not remove Minerva.

## Critical Rules

1. Preserve existing functionality.
2. Do not rewrite working features unnecessarily.
3. Do not modify the UI unless required.
4. Do not add unnecessary dependencies.
5. Do not bypass the backend to access Firestore.
6. Do not expose secrets to the client.
7. Do not put business logic inside React components.
8. Do not blindly suppress ESLint errors.
9. Do not blindly add useEffect dependencies.
10. Inspect existing code before changing it.
11. Make small, verifiable changes.
12. Run lint/build after major changes.

## Data Architecture

Firestore is the persistent datastore.

Collections:

- users
- conversations (currently nested under users/{userId}/conversations)
- tasks
- notes
- journalEntries
- calendarEvents
- wellnessEntries

Messages subcollection:

- conversations/{conversationId}/messages

Frontend must communicate through the backend API.

```
React → Express → Firestore / Vertex AI
```

**Problem to fix:** `client/src/firebase.js` currently accesses Firestore directly from the client.
This must be migrated to go through the backend API.

## Backend Architecture

```
Route
  ↓
Controller
  ↓
Service
  ↓
Firestore / Vertex AI
```

Do not put database or business logic directly in routes.

## Frontend Architecture

Prefer this structure:

```
pages/
features/
components/
hooks/
services/
utils/
```

Feature-specific logic should stay inside its feature folder.

## Styling

Use Tailwind CSS.

Do not introduce new component-specific CSS files unless there is a genuinely unavoidable reason.

## Refactoring

Large files currently exist. Do not split files purely based on line count.

Split by responsibility.

Do not refactor all large components simultaneously. Work phase by phase.

## Minerva

Minerva is intentionally retained for future use.

Do not delete it.

Do not start it with the normal Athena development server.

Current state: MINERVA_ENABLED=false

## Verification

After changes:

```
npm run lint
npm run build
```

Do not claim tests passed unless actually run.

## Context Files

See `.claude/context/` for:
- ARCHITECTURE.md — current vs. target architecture
- DATABASE_SCHEMA.md — canonical Firestore schema
- REFACTOR_PLAN.md — phase order
- CURRENT_STATE.md — known problems and status
