'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const wellness = require('../controllers/wellness.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(wellness.list));
router.post('/', asyncHandler(wellness.create));
router.get('/:id', asyncHandler(wellness.get));
router.patch('/:id', asyncHandler(wellness.update));
router.delete('/:id', asyncHandler(wellness.remove));

module.exports = router;
