'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const events = require('../controllers/calendar.controller');

const router = Router();

router.use(requireAuth);

router.get('/events', asyncHandler(events.list));
router.post('/events', asyncHandler(events.create));
router.get('/events/:id', asyncHandler(events.get));
router.patch('/events/:id', asyncHandler(events.update));
router.delete('/events/:id', asyncHandler(events.remove));

module.exports = router;
