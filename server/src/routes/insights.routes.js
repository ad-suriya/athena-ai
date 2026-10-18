'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const insights = require('../controllers/insights.controller');

const router = Router();

router.use(requireAuth);

router.get('/activity', asyncHandler(insights.activity));

module.exports = router;
