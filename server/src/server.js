'use strict';

// Entry point: load environment, then start the HTTP server.
require('dotenv').config();

const env = require('./config/env');
const { isAvailable: isVertexAvailable } = require('./config/vertex');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`🚀 Server running on http://localhost:${env.port}`);
  console.log('🛡️  Security middleware enabled');
  console.log(`🤖 Vertex AI (Gemini): ${isVertexAvailable() ? env.vertex.model : 'disabled'}`);
  console.log(`🔮 Minerva: disabled (future)`);
});
