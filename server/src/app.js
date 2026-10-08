'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// === Security middleware ===
app.use(helmet());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// === Rate limiting ===
app.use('/api', apiLimiter);

// === Body parsing ===
// Notes hold rich-text HTML (including inline images), so they get a larger limit.
// It must be registered before the global parser, which then skips the parsed body.
app.use('/api/notes', express.json({ limit: '1mb' }));
app.use(express.json({ limit: '10kb' }));

// === CORS ===
app.use(cors({
  origin: env.nodeEnv === 'production'
    ? env.cors.allowedOrigins
    : [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());

// === Routes ===
app.use('/api', routes);

// === 404 ===
app.use((req, res) => res.status(404).json({
  success: false,
  error: { code: 'ENDPOINT_NOT_FOUND', message: 'Endpoint not found' },
}));

// === Error handler (must be last) ===
app.use(errorHandler);

module.exports = app;
