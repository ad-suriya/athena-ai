'use strict';

const { generateText, isAvailable } = require('../config/vertex');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

const SYSTEM_PROMPT = `You are Athena AI — an empathetic and reflective counseling assistant, running on the Gemini model.

Your purpose is to help users understand and process their emotions, gain insight, and practice self-compassion. You respond with warmth, clarity, and gentle curiosity, using short paragraphs and simple language so the user never feels overwhelmed.`.trim();

// Upper bound on prior messages sent to the model. The largest existing
// conversation has 40 messages, so this keeps full context for all of them.
const MAX_CONTEXT_MESSAGES = 50;

// history: [{ role: 'user' | 'assistant', content }] — prior turns, NOT including `message`.
const buildContext = (message, history = []) => {
  const conversationHistory = Array.isArray(history)
    ? history
        .filter((msg) => msg?.role && msg?.content)
        .slice(-MAX_CONTEXT_MESSAGES)
        .map((msg) => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n\n')
    : '';

  return conversationHistory
    ? `${SYSTEM_PROMPT}\n\n${conversationHistory}\n\nHuman: ${message}\n\nAssistant:`
    : `${SYSTEM_PROMPT}\n\nHuman: ${message}\n\nAssistant:`;
};

// Converts Vertex/SDK failures into client-safe AppErrors; details stay in server logs.
const handleAIError = (err) => {
  if (err instanceof AppError) return err;
  console.error('Vertex AI error:', err);
  return new AppError(502, 'AI_ERROR', 'The AI service failed to respond. Please try again.');
};

const generateResponse = async (message, history = []) => {
  if (!isAvailable()) {
    throw new AppError(503, 'AI_UNAVAILABLE', 'Gemini (Vertex AI) service is not configured');
  }

  try {
    const text = await generateText(buildContext(message, history));
    if (!text) {
      throw new Error('Empty response from Vertex AI');
    }

    return { text, model: env.vertex.model };
  } catch (err) {
    throw handleAIError(err);
  }
};

module.exports = { generateResponse, buildContext, handleAIError, SYSTEM_PROMPT };
