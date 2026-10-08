'use strict';

const { admin, firebaseApp } = require('../config/firebase');
const env = require('../config/env');
const userService = require('../services/user.service');

// POST /api/auth/google
// Verifies a Firebase ID token, creates/updates users/{uid}, and returns the user record.
// Response format kept as-is since frontend depends on it.
const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  if (!firebaseApp && env.nodeEnv !== 'production') {
    console.warn('⚠️  Firebase not initialized. Dev mode bypass.');
    return res.status(200).json({
      user: { email: 'dev@example.com', uid: 'dev-user-id', isDev: true },
    });
  }

  if (!firebaseApp) {
    return res.status(503).json({ error: 'Authentication service unavailable' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    try {
      await userService.upsertUser(userRecord);
    } catch (err) {
      console.error('User profile upsert failed:', err);
      return res.status(500).json({ error: 'Could not save user profile' });
    }

    return res.status(200).json({
      message: 'Authenticated',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'User',
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(401).json({
      error: 'Authentication failed',
      details: env.nodeEnv === 'development' ? err.message : undefined,
    });
  }
};

module.exports = { googleAuth };
