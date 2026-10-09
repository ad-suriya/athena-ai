'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const mindmap = require('../controllers/mindmap.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(mindmap.get));
router.put('/', asyncHandler(mindmap.save));

module.exports = router;
