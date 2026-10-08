'use strict';

const aiService = require('../services/ai.service');

// POST /api/chat
// Response format kept as { response, modelUsed } since frontend depends on data.response check.
const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  console.log(`📨 Chat request — "${message.substring(0, 50)}..."`);

  try {
    const { text, model } = await aiService.generateResponse(message, history);
    return res.json({ response: text, modelUsed: model });
  } catch (err) {
    // ai.service only throws client-safe AppErrors.
    return res.status(err.status || 500).json({ error: err.message || 'Chat service error' });
  }
};

module.exports = { chat };
