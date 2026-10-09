'use strict';

const { GoogleGenAI } = require('@google/genai');
const env = require('./env');

// Gemini on Vertex AI via the Google Gen AI SDK. Authenticates with Application
// Default Credentials (GOOGLE_APPLICATION_CREDENTIALS points at the service account).
let client = null;

const initializeVertex = () => {
  const { projectId, location, model } = env.vertex;

  if (!projectId || !location) {
    console.warn('⚠️  Vertex AI: VERTEX_PROJECT_ID or VERTEX_LOCATION not set — AI unavailable');
    return null;
  }

  try {
    const genai = new GoogleGenAI({ vertexai: true, project: projectId, location });
    console.log(`✅ Vertex AI initialized (${model})`);
    return genai;
  } catch (err) {
    console.error('❌ Vertex AI initialization error:', err);
    return null;
  }
};

client = initializeVertex();

const isAvailable = () => client !== null;

// One request to the configured Gemini model. Returns the response text ('' if none).
const generateText = async (prompt) => (await generate({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })).text;

// Web pages Gemini used when grounded with Google Search: [{ title, url }], deduplicated.
const sourcesOf = (response) => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const seen = new Set();
  return chunks
    .map((c) => c.web)
    .filter((web) => web?.uri && !seen.has(web.uri) && seen.add(web.uri))
    .map((web) => ({ title: web.title || web.uri, url: web.uri }));
};

// Multi-turn request. contents: [{ role: 'user' | 'model', parts }].
// Options: systemInstruction (string), tools (SDK tool list, e.g. [{ googleSearch: {} }]).
// Returns { text, sources, response } — response is the raw SDK result (function calls etc.).
const generate = async ({ contents, systemInstruction, tools }) => {
  const { model, maxTokens, temperature } = env.vertex;
  const response = await withRetry(() => client.models.generateContent({
    model,
    contents,
    config: {
      maxOutputTokens: maxTokens,
      temperature,
      ...(systemInstruction ? { systemInstruction } : {}),
      ...(tools ? { tools } : {}),
    },
  }));
  return { text: textOf(response), sources: sourcesOf(response), response };
};

// The reply's text parts (not thoughts or function calls).
const textOf = (response) => (response.candidates?.[0]?.content?.parts || [])
  .filter((p) => typeof p.text === 'string' && !p.thought)
  .map((p) => p.text)
  .join('');

// Vertex returns 429 when the project's per-minute quota is used up. Retry a few
// times with backoff (≈1s, 2s, 4s) before giving up.
const RETRY_DELAYS_MS = [1000, 2000, 4000];
const isRateLimit = (err) => err?.status === 429 || /RESOURCE_EXHAUSTED/.test(err?.message || '');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const withRetry = async (call) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await call();
    } catch (err) {
      if (!isRateLimit(err) || attempt >= RETRY_DELAYS_MS.length) throw err;
      await sleep(RETRY_DELAYS_MS[attempt] + Math.floor(Math.random() * 250));
    }
  }
};

module.exports = { isAvailable, generateText, generate, isRateLimit };
