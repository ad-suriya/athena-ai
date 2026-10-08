'use strict';

const { VertexAI } = require('@google-cloud/vertexai');
const env = require('./env');

let generativeModel = null;

const initializeVertex = () => {
  const { projectId, location, model, maxTokens, temperature } = env.vertex;

  if (!projectId || !location) {
    console.warn('⚠️  Vertex AI: VERTEX_PROJECT_ID or VERTEX_LOCATION not set — AI unavailable');
    return null;
  }

  try {
    const vertexAI = new VertexAI({ project: projectId, location });
    const m = vertexAI.preview.getGenerativeModel({
      model,
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    });
    console.log(`✅ Vertex AI initialized (${model})`);
    return m;
  } catch (err) {
    console.error('❌ Vertex AI initialization error:', err);
    return null;
  }
};

generativeModel = initializeVertex();

const isAvailable = () => generativeModel !== null;

module.exports = { generativeModel, isAvailable };
