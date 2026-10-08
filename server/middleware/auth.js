'use strict';

const { admin } = require('../config/firebase');
const { unauthorized } = require('../utils/response');

// Verifies the Firebase ID token in the Authorization: Bearer <token> header.
// Sets req.user = { uid, email, ... } on success.
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing or invalid Authorization header');
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!admin || admin.apps.length === 0) {
    return unauthorized(res, 'Authentication service unavailable');
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token');
  }
};

module.exports = { requireAuth };
