'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const tasks = require('../controllers/tasks.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(tasks.list));
router.post('/', asyncHandler(tasks.create));
router.get('/:id', asyncHandler(tasks.get));
router.patch('/:id', asyncHandler(tasks.update));
router.delete('/:id', asyncHandler(tasks.remove));

module.exports = router;
