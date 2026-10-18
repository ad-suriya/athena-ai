# Journal search (RAG)

Athena's chat agent can search the user's journal by meaning with the
`search_journal` tool, so "when did I feel burnt out?" also finds an entry that
says "exhausted at work". Code: `server/src/services/journalSearch.service.js`.

## How it works

1. When a journal entry (`notes` collection) is created or its title or text
   changes, `note.service` starts indexing in the background. The entry is split
   into passages of up to 1500 characters, each passage is embedded with Vertex AI
   (`EMBEDDING_MODEL`), and the passages are stored in `noteChunks`. Deleting an
   entry deletes its passages. Saving never waits on this, and indexing errors are
   only logged.
2. In chat, the agent calls `search_journal(query)`. The server embeds the query and
   runs a Firestore vector query (`findNearest`, cosine distance) over that user's
   passages only, and returns the best passage of each matching entry.
3. The model answers from those passages, or reads a whole entry with
   `read_journal_entry`.

Everything runs on the server. The client never sees embeddings.

## Setup (once per Firebase project)

1. **Create the vector index.** Search fails until it exists (the tool then tells
   the model to fall back to `list_journal_entries`).

   ```sh
   gcloud firestore indexes composite create \
     --project=<FIREBASE_PROJECT_ID> \
     --collection-group=noteChunks \
     --query-scope=COLLECTION \
     --field-config=field-path=userId,order=ascending \
     --field-config='field-path=embedding,vector-config={"dimension":"768","flat":"{}"}'
   ```

   Building the index takes a few minutes. Check it with
   `gcloud firestore indexes composite list --project=<FIREBASE_PROJECT_ID>`.

2. **Index existing entries.** New and edited entries are indexed automatically.

   ```sh
   cd server
   node scripts/index-journal.js           # dry run: counts only
   node scripts/index-journal.js --apply   # embed and write
   ```

   The script is idempotent; unchanged entries are skipped.

## Changing the embedding model

`EMBEDDING_MODEL` and `EMBEDDING_DIMENSIONS` must match the index. To change them:
delete the `noteChunks` collection, recreate the index with the new dimension, and
run the script with `--apply`. Firestore vectors hold at most 2048 dimensions.

## Limits

- Entries are indexed up to 40 passages (about 60,000 characters).
- If an entry is saved twice in quick succession, a slower first indexing run can
  in rare cases finish last and leave the older passages. The next edit, or running
  the script, fixes it.
