'use strict';

const { generate, isAvailable } = require('../config/vertex');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

const SYSTEM_PROMPT = `You are Athena AI — an empathetic and reflective counseling assistant, running on the Gemini model.

Your purpose is to help users understand and process their emotions, gain insight, and practice self-compassion. You respond with warmth, clarity, and gentle curiosity, using short paragraphs and simple language so the user never feels overwhelmed.`.trim();

const ATTACHMENT_NOTE = 'The user attached files to this message; their contents are included above the text. Read them and answer from them — never say you cannot see attachments.';

const SEARCH_NOTE = 'The user turned on web search for this message: use Google Search for current or factual information.';

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
  console.error('Vertex AI error:', err);
  return new AppError(502, 'AI_ERROR', 'The AI service failed to respond. Please try again.');
};

const assertAvailable = () => {
  if (!isAvailable()) {
    throw new AppError(503, 'AI_UNAVAILABLE', 'Gemini (Vertex AI) service is not configured');
  }
};

// history: prior turns, NOT including `message`.
// options.search: ground the answer with Google Search (returns sources).
// options.attachments: files for this message (images, PDFs, text).
// → { text, model, sources: [{ title, url }] }
const generateResponse = async (message, history = [], { search = false, attachments = [] } = {}) => {
  assertAvailable();
  try {
    const contents = toContents(history);
    const turn = userTurn(message, attachments);
    // After a failed reply the history ends with a user turn: continue that turn.
    const last = contents[contents.length - 1];
    if (last?.role === 'user') last.parts.push(...turn.parts);
    else contents.push(turn);

    const { text, sources } = await generate({
      contents,
      systemInstruction: [SYSTEM_PROMPT, search && SEARCH_NOTE, attachments.length && ATTACHMENT_NOTE].filter(Boolean).join('\n\n'),
      tools: search ? [{ googleSearch: {} }] : undefined,
    });
    if (!text) throw new Error('Empty response from Vertex AI');
    return { text, model: env.vertex.model, sources };
  } catch (err) {
    throw handleAIError(err);
  }
};

module.exports = { generateResponse, toContents, handleAIError, assertAvailable, SYSTEM_PROMPT };
