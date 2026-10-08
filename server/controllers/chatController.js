'use strict';

const chatService = require('../services/chatService');
const env = require('../config/env');

// POST /api/chat
// Response format kept as { response, modelUsed } since frontend depends on data.response check.
const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  console.log(`📨 Chat request — "${message.substring(0, 50)}..."`);

  try {
    const { text, model } = await chatService.chat(message, history);
    return res.json({ response: text, modelUsed: model });
  } catch (err) {
    console.error('Chat error:', err);
    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || 'Chat service error',
      details: env.nodeEnv === 'development' ? err.stack : undefined,
    });
  }
};

module.exports = { chat };
