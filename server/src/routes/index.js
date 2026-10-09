'use strict';

// Mounts every API router under /api (see app.js).
const { Router } = require('express');
const { aiLimiter } = require('../middleware/rateLimit.middleware');

const router = Router();

router.use('/', require('./health.routes'));
router.use('/auth', require('./auth.routes'));
router.use('/chat', aiLimiter, require('./chat.routes'));
router.use('/tasks', require('./tasks.routes'));
router.use('/notes', require('./notes.routes'));
router.use('/calendar', require('./calendar.routes'));
router.use('/journal', require('./journal.routes'));
router.use('/wellness', require('./wellness.routes'));
router.use('/conversations', require('./conversations.routes'));
router.use('/users', require('./users.routes'));
router.use('/mindmap', require('./mindmap.routes'));
router.use('/feedback', require('./feedback.routes'));

module.exports = router;
