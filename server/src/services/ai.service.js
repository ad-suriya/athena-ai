'use strict';

const { generate, isAvailable, isRateLimit } = require('../config/vertex');
const env = require('../config/env');
const { AppError } = require('../utils/errors');
const { functionDeclarations, runTool, isReadOnly } = require('../agent/tools');
const { buildAgent } = require('../agent/graph');
const { buildSnapshot } = require('../agent/snapshot');
const { isCrisis, SAFETY_NOTE, crisisResources } = require('../agent/safety');

const SYSTEM_PROMPT = `You are Athena AI — an empathetic and reflective counseling assistant, running on the Gemini model.

Your purpose is to help users understand and process their emotions, gain insight, and practice self-compassion. You respond with warmth, clarity, and gentle curiosity, using short paragraphs and simple language so the user never feels overwhelmed.`.trim();

const ATTACHMENT_NOTE = 'The user attached files to this message; their contents are included above the text. Read them and answer from them — never say you cannot see attachments.';

const SEARCH_NOTE = 'The user turned on web search for this message: use Google Search for current or factual information.';

const AGENT_NOTE = `You can read and change the user's data in the Athena app with your tools: tasks, journal entries, calendar events and the mind map.
- The tools are an extra, not a limit. Answer general questions (recommend books, explain ideas, give advice) from your own knowledge as usual.
- When the user asks you to add, change, complete or delete something, do it with the tools straight away. Do not ask for confirmation, including for deletions.
- Find ids in the snapshot below or with the list/read tools first. Never invent ids.
- If more than one item could match and the request does not say which, ask which one instead of guessing.
- Every change needs a tool call in this same reply; nothing changes otherwise. Only say you did something if the tool succeeded; if a tool returns an error, explain it plainly.
- Do each change once, in the turn it is asked for. Never carry out an earlier request later unless the user asks again.
- After acting, briefly say what you did. Keep your usual warm, short style.
- When you create tasks for an idea on the mind map, pass its node id as mindMapNodeId so the tasks are linked to it.
- For times, use ISO 8601 with the user's UTC offset.
- Earlier replies may end with "(Actions taken: …)". That note is added by the app; never write it yourself.`;

// The tool-using agent (LangGraph). Loads the today snapshot, then up to 8 model
// rounds per message; each round may run several tool calls.
const agent = buildAgent({ generate, runTool, functionDeclarations, isReadOnly, loadContext: buildSnapshot, maxRounds: 8 });

// Shown if Gemini fails on a crisis turn: the support contacts must always reach the user.
const CRISIS_FALLBACK = 'I\'m really glad you told me. What you\'re feeling matters, and you deserve support right now.';

// "Friday, 9 October 2026, 15:04 (Asia/Kolkata, UTC+05:30)" — the model's sense of "now".
const describeNow = (timeZone) => {
  const tz = timeZone || 'UTC';
  const now = new Date();
  const when = now.toLocaleString('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
    .formatToParts(now).find((p) => p.type === 'timeZoneName')?.value.replace('GMT', 'UTC') || 'UTC';
  return `${when} (${tz}, ${offset === 'UTC' ? 'UTC+00:00' : offset})`;
};

// Upper bound on prior messages sent to the model. The largest existing
// conversation has 40 messages, so this keeps full context for all of them.
const MAX_CONTEXT_MESSAGES = 50;

// history: [{ role: 'user' | 'assistant', content }] → Gemini contents.
// Consecutive same-role turns are merged, as Gemini expects alternating roles.
const toContents = (history = []) => {
  const contents = [];
  (Array.isArray(history) ? history : [])
    .filter((msg) => msg?.role && msg?.content)
    .slice(-MAX_CONTEXT_MESSAGES)
    .forEach((msg) => {
      const role = msg.role === 'user' ? 'user' : 'model';
      const last = contents[contents.length - 1];
      if (last?.role === role) last.parts.push({ text: msg.content });
      else contents.push({ role, parts: [{ text: msg.content }] });
    });
  // Gemini expects the conversation to open with a user turn.
  if (contents[0]?.role === 'model') contents.unshift({ role: 'user', parts: [{ text: '(Conversation start)' }] });
  return contents;
};

// attachments: [{ name, mimeType, data (base64) }] sent with this message only.
const userTurn = (message, attachments = []) => ({
  role: 'user',
  parts: [
    ...attachments.map((a) => ({ inlineData: { mimeType: a.mimeType, data: a.data } })),
    { text: attachments.length ? `${message}\n\n(Attached: ${attachments.map((a) => a.name).join(', ')})` : message },
  ],
});

// Converts Vertex/SDK failures into client-safe AppErrors; details stay in server logs.
const handleAIError = (err) => {
  if (err instanceof AppError) return err;
  if (isRateLimit(err)) {
    return new AppError(503, 'AI_BUSY', 'Athena is getting a lot of requests right now. Please try again in a minute.');
  }
  console.error('Vertex AI error:', err);
  return new AppError(502, 'AI_ERROR', 'The AI service failed to respond. Please try again.');
};

const assertAvailable = () => {
  if (!isAvailable()) {
    throw new AppError(503, 'AI_UNAVAILABLE', 'Gemini (Vertex AI) service is not configured');
  }
};

// history: prior turns, NOT including `message`.
// options.search: ground the answer with Google Search (returns sources). Gemini cannot
//   search and use app tools in the same request, so search turns tools off.
// options.attachments: files for this message (images, PDFs, text).
// options.userId: lets Athena act on this user's data with tools (omit for plain chat).
// options.timeZone: the user's IANA time zone, for dates like "tomorrow at 3".
// Safety: if the message has crisis language (agent/safety), the turn runs without
//   tools or search, and support contacts are added under the reply.
// → { text, model, sources: [{ title, url }], actions: [string] }
const generateResponse = async (message, history = [], { search = false, attachments = [], userId = null, timeZone = null } = {}) => {
  assertAvailable();
  try {
    const contents = toContents(history);
    const turn = userTurn(message, attachments);
    // After a failed reply the history ends with a user turn: continue that turn.
    const last = contents[contents.length - 1];
    if (last?.role === 'user') last.parts.push(...turn.parts);
    else contents.push(turn);

    const crisis = isCrisis(message);
    const useSearch = search && !crisis;
    const useTools = Boolean(userId) && !search && !crisis;
    const systemInstruction = [
      SYSTEM_PROMPT,
      `Current date and time for the user: ${describeNow(timeZone)}.`,
      useTools && AGENT_NOTE,
      useSearch && SEARCH_NOTE,
      attachments.length && ATTACHMENT_NOTE,
      crisis && SAFETY_NOTE,
    ].filter(Boolean).join('\n\n');

    if (crisis) {
      let text;
      try {
        ({ text } = await generate({ contents, systemInstruction }));
      } catch (err) {
        console.error('Vertex AI error on a crisis turn:', err);
      }
      return { text: `${(text || CRISIS_FALLBACK).trim()}\n\n${crisisResources(timeZone)}`, model: env.vertex.model, sources: [], actions: [] };
    }

    if (!useTools) {
      const { text, sources } = await generate({ contents, systemInstruction, tools: useSearch ? [{ googleSearch: {} }] : undefined });
      if (!text) throw new Error('Empty response from Vertex AI');
      return { text, model: env.vertex.model, sources, actions: [] };
    }

    const { text, actions } = await agent.run({ contents, userId, timeZone, systemInstruction });
    return { text, model: env.vertex.model, sources: [], actions };
  } catch (err) {
    throw handleAIError(err);
  }
};

module.exports = { generateResponse, toContents, handleAIError, assertAvailable, describeNow, SYSTEM_PROMPT };
