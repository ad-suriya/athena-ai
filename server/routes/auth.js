'use strict';

const { Router } = require('express');
const { googleAuth } = require('../controllers/authController');

const router = Router();

router.post('/google', googleAuth);

module.exports = router;
