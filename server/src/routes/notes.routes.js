'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const notes = require('../controllers/notes.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(notes.list));
router.post('/', asyncHandler(notes.create));
router.get('/:id', asyncHandler(notes.get));
router.patch('/:id', asyncHandler(notes.update));
router.delete('/:id', asyncHandler(notes.remove));

module.exports = router;
