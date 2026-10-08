'use strict';

const rateLimit = require('express-rate-limit');

const limitExceeded = (code, message) => ({ success: false, error: { code, message } });

// General API traffic. CRUD screens (tasks, notes, calendar) make a request per edit,
// so this is higher than the AI limit below.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitExceeded('RATE_LIMITED', 'Too many requests, please try again later'),
});

// Endpoints that call Vertex AI. Same budget the whole API had before Phase 2.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitExceeded('RATE_LIMITED', 'Too many AI requests, please try again later'),
});

module.exports = { apiLimiter, aiLimiter };
