'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { chat } = require('../controllers/chatController');

const router = Router();

// Legacy endpoint; the client now uses POST /api/conversations/:id/messages.
// Requires auth so it is not an open Vertex AI proxy.
router.post('/', requireAuth, chat);

module.exports = router;
