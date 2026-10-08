'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const users = require('../controllers/users.controller');

const router = Router();

router.use(requireAuth);

router.get('/me', asyncHandler(users.me));

module.exports = router;
