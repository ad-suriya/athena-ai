'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { firebaseApp } = require('./config/firebase');
const { isAvailable: isVertexAvailable } = require('./config/vertex');
const { errorHandler } = require('./middleware/errorHandler');
const env2 = env; // alias to avoid re-requiring

const app = express();

// === Security middleware ===
app.use(helmet());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// === Rate limiting ===
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
}));

// === Body parsing ===
app.use(express.json({ limit: '10kb' }));

// === CORS ===
app.use(cors({
  origin: env.nodeEnv === 'production'
    ? env.cors.allowedOrigins
    : [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());

// === Routes ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

// === Health check ===
app.get('/api/health', (req, res) => {
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

// === Minerva status (future service — currently disabled) ===
app.get('/api/minerva-status', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'minerva',
      enabled: false,
      status: 'disabled',
    },
  });
});

// === 404 ===
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// === Error handler (must be last) ===
app.use(errorHandler);

// === Start ===
app.listen(env.port, () => {
  console.log(`🚀 Server running on http://localhost:${env.port}`);
  console.log('🛡️  Security middleware enabled');
  console.log(`🤖 Vertex AI (Gemini): ${isVertexAvailable() ? env.vertex.model : 'disabled'}`);
  console.log(`🔮 Minerva: disabled (future)`);
});
