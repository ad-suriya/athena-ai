'use strict';

// Central environment configuration.
// All process.env reads in the server should come through here.

const env = {
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },

  vertex: {
    projectId: process.env.VERTEX_PROJECT_ID,
    location: process.env.VERTEX_LOCATION,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    maxTokens: parseInt(process.env.MAX_TOKENS, 10) || 1000,
    temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  },

  minerva: {
    enabled: process.env.MINERVA_ENABLED === 'true',
    url: process.env.MINERVA_URL || '',
  },
};

// Warn on missing required variables (do not throw — allow degraded startup with warnings).
const required = [
  ['FIREBASE_PROJECT_ID', env.firebase.projectId],
  ['FIREBASE_CLIENT_EMAIL', env.firebase.clientEmail],
  ['FIREBASE_PRIVATE_KEY', env.firebase.privateKey],
  ['VERTEX_PROJECT_ID', env.vertex.projectId],
  ['VERTEX_LOCATION', env.vertex.location],
];

for (const [name, value] of required) {
  if (!value) {
    console.warn(`⚠️  Missing env var: ${name}`);
  }
}

module.exports = env;
