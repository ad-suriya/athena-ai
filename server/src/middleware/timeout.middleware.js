'use strict';

// Answers 503 if a request is still running after `ms` (e.g. Firestore unreachable),
// instead of leaving the browser waiting for minutes. AI routes get a longer limit.
const DEFAULT_MS = 20000;
const AI_MS = 120000;
const AI_ROUTES = [
  /^\/api\/conversations\/[^/]+\/messages$/,
  /^\/api\/conversations\/[^/]+\/messages\/[^/]+\/regenerate$/,
  /^\/api\/chat$/,
];

const requestTimeout = (req, res, next) => {
  const ms = req.method === 'POST' && AI_ROUTES.some((r) => r.test(req.path)) ? AI_MS : DEFAULT_MS;
  const timer = setTimeout(() => {
    if (res.headersSent) return;
    console.error(`⏱️  ${req.method} ${req.originalUrl} timed out after ${ms / 1000}s`);
    res.status(503).json({
      success: false,
      error: { code: 'SERVICE_TIMEOUT', message: 'The server could not reach the database in time. Please try again.' },
    });
  }, ms);
  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
};

module.exports = { requestTimeout, DEFAULT_MS, AI_MS };
