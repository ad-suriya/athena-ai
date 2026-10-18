'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const journal = require('../controllers/journal.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(journal.list));
router.post('/', asyncHandler(journal.create));
router.get('/:id', asyncHandler(journal.get));
router.patch('/:id', asyncHandler(journal.update));
router.delete('/:id', asyncHandler(journal.remove));

module.exports = router;
