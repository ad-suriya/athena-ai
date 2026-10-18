'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const mindmap = require('../controllers/mindmap.controller');
const mindmapAi = require('../controllers/mindmapAi.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(mindmap.get));
router.put('/', asyncHandler(mindmap.save));
router.get('/linked-tasks', asyncHandler(mindmapAi.linkedTasks));

// Athena: proposals (nothing is saved), plan execution, and questions.
router.post('/ai/generate', aiLimiter, asyncHandler(mindmapAi.generate));
router.post('/ai/expand', aiLimiter, asyncHandler(mindmapAi.expand));
router.post('/ai/connections', aiLimiter, asyncHandler(mindmapAi.connections));
router.post('/ai/plan', aiLimiter, asyncHandler(mindmapAi.plan));
router.post('/ai/ask', aiLimiter, asyncHandler(mindmapAi.ask));
router.post('/ai/execute', asyncHandler(mindmapAi.execute));

module.exports = router;
