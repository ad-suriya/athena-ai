'use strict';

const { generativeModel, isAvailable } = require('../config/vertex');
const env = require('../config/env');

const SYSTEM_PROMPT = `You are Athena AI — an empathetic and reflective counseling assistant, running on the Gemini model.

Your purpose is to help users understand and process their emotions, gain insight, and practice self-compassion. You respond with warmth, clarity, and gentle curiosity, using short paragraphs and simple language so the user never feels overwhelmed.`.trim();

const chat = async (message, history = []) => {
  if (!isAvailable()) {
    throw Object.assign(new Error('Gemini (Vertex AI) service is not configured'), { code: 'AI_UNAVAILABLE', status: 503 });
  }

  const conversationHistory = Array.isArray(history)
    ? history
        .filter((msg) => msg?.role && msg?.content)
        .map((msg) => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n\n')
    : '';

  const prompt = conversationHistory
    ? `${SYSTEM_PROMPT}\n\n${conversationHistory}\n\nHuman: ${message}\n\nAssistant:`
    : `${SYSTEM_PROMPT}\n\nHuman: ${message}\n\nAssistant:`;

  const result = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const response = await result.response;

  if (!response?.candidates?.length) {
    throw new Error('Empty response from Vertex AI');
  }

  return {
    text: response.candidates[0].content.parts[0].text,
    model: env.vertex.model,
  };
};

module.exports = { chat };
