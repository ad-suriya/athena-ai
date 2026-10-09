'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const feedback = require('../controllers/feedback.controller');

const router = Router();

router.use(requireAuth);

router.post('/', asyncHandler(feedback.create));

module.exports = router;
