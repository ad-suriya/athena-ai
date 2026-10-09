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
const generateText = async (prompt) => {
  const { model, maxTokens, temperature } = env.vertex;
  const response = await client.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { maxOutputTokens: maxTokens, temperature },
  });
  return response.text || '';
};

module.exports = { isAvailable, generateText };
