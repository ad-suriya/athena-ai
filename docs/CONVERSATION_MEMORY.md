# Conversation memory

Athena can recall earlier conversations with the `search_past_conversations` tool,
so "like I told you last week…" works. Code: `server/src/services/memory.service.js`.
Journal search (`docs/JOURNAL_SEARCH.md`) works the same way for journal entries.

## How it works

1. Once a conversation has 4 messages, Gemini writes a short summary of it (at most
   120 words, third person). The summary is embedded with Vertex AI and stored in
   `conversationMemories/{conversationId}`. This runs in the background after a
   reply, so chat never waits on it.
2. The summary is rewritten after every 6 new messages, and right away after a
   message is edited or a reply regenerated. Deleting a conversation deletes its
   memory.
3. In chat, the agent calls `search_past_conversations(query)` when the user refers
   back to an earlier chat. The server embeds the query and runs a Firestore vector
   query over that user's memories only, leaving out the current conversation
   (already in context).

Crisis conversations are summarized only as "went through a very hard time and was
given support contacts", with no details.

## The user's switch

Memory is on by default. The Profile page has a switch
(`PATCH /api/users/me/settings { memoryEnabled }`, stored as
`users/{uid}.memoryEnabled`). Turning it off deletes all of that user's memories and
stops new ones; the tool then tells the model memory is off. Turning it back on
remembers chats from then on; run the script below to rebuild older ones.

## Setup (once per Firebase project)

1. **Create the vector index.** Search fails until it exists (the tool then reports
   that memory is unavailable).

   ```sh
   gcloud firestore indexes composite create \
     --project=<FIREBASE_PROJECT_ID> \
     --collection-group=conversationMemories \
     --query-scope=COLLECTION \
     --field-config=field-path=userId,order=ascending \
     --field-config='field-path=embedding,vector-config={"dimension":"768","flat":"{}"}'
   ```

2. **Summarize existing conversations.** This calls Gemini once per conversation
   with 4 or more messages.

   ```sh
   cd server
   node scripts/index-memories.js           # dry run: counts only
   node scripts/index-memories.js --apply
   ```

   Re-running it also catches up chats whose last few messages arrived after
   their summary was written (fewer than 6, so the chat did not refresh it).

## Limits

- Summaries cover the most recent ~12,000 characters of a conversation.
- The last few messages of a chat may not be in its summary until the script runs
  or the chat continues.
- The dimension (768) must match `EMBEDDING_DIMENSIONS`; see `docs/JOURNAL_SEARCH.md`.
