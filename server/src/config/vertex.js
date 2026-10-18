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
// Structured output: responseSchema (Gemini schema) makes the reply JSON of that shape.
// maxOutputTokens / temperature / thinkingBudget override the env defaults for one call.
// Returns { text, sources, response } — response is the raw SDK result (function calls etc.).
const generate = async ({ contents, systemInstruction, tools, responseSchema, maxOutputTokens, temperature, thinkingBudget }) => {
  const { model } = env.vertex;
  const response = await withRetry(() => client.models.generateContent({
    model,
    contents,
    config: {
      maxOutputTokens: maxOutputTokens ?? env.vertex.maxTokens,
      temperature: temperature ?? env.vertex.temperature,
      ...(systemInstruction ? { systemInstruction } : {}),
      ...(tools ? { tools } : {}),
      ...(responseSchema ? { responseMimeType: 'application/json', responseSchema } : {}),
      ...(thinkingBudget !== undefined ? { thinkingConfig: { thinkingBudget } } : {}),
    },
  }));
  return { text: textOf(response), sources: sourcesOf(response), response };
};

// One embedding vector per text, for journal search. taskType is 'RETRIEVAL_DOCUMENT'
// for stored text and 'RETRIEVAL_QUERY' for a search. One request per text, so any
// embedding model works (some take only one input per request).
const embed = async (texts, taskType) => {
  const { embeddingModel, embeddingDimensions } = env.vertex;
  const vectors = [];
  for (const text of texts) {
    const response = await withRetry(() => client.models.embedContent({
      model: embeddingModel,
      contents: text,
      config: { taskType, outputDimensionality: embeddingDimensions },
    }));
    const values = response.embeddings?.[0]?.values;
    if (!values?.length) throw new Error('Empty embedding from Vertex AI');
    vectors.push(values);
  }
  return vectors;
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

module.exports = { isAvailable, generateText, generate, embed, isRateLimit };
