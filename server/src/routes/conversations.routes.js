'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const conversations = require('../controllers/conversations.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(conversations.list));
router.post('/', asyncHandler(conversations.create));
router.get('/:id', asyncHandler(conversations.get));
router.patch('/:id', asyncHandler(conversations.update));
router.delete('/:id', asyncHandler(conversations.remove));

router.get('/:id/messages', asyncHandler(conversations.listMessages));
// Endpoints below call Vertex AI.
router.post('/:id/messages', aiLimiter, asyncHandler(conversations.sendMessage));
router.patch('/:id/messages/:messageId', asyncHandler(conversations.editMessage));
router.put('/:id/messages/:messageId/rating', asyncHandler(conversations.rateMessage));
router.post('/:id/messages/:messageId/regenerate', aiLimiter, asyncHandler(conversations.regenerateMessage));

module.exports = router;
