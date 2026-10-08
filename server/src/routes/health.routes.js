'use strict';

const { Router } = require('express');
const env = require('../config/env');
const { firebaseApp } = require('../config/firebase');
const { isAvailable: isVertexAvailable } = require('../config/vertex');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    services: {
      firebase: firebaseApp ? 'operational' : 'unavailable',
      gemini: isVertexAvailable() ? 'operational' : 'unavailable',
    },
  });
});

// Minerva is a future service — currently disabled (MINERVA_ENABLED=false).
router.get('/minerva-status', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'minerva',
      enabled: false,
      status: 'disabled',
    },
  });
});

module.exports = router;
