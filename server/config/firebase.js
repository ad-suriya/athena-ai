'use strict';

const admin = require('firebase-admin');
const env = require('./env');

let db = null;

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return admin.apps[0];
  }

  const { projectId, clientEmail, privateKey, databaseURL } = env.firebase;

  if (!privateKey || !projectId || !clientEmail) {
    console.warn('⚠️  Firebase Admin: missing credentials — Firestore unavailable');
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({ project_id: projectId, private_key: privateKey, client_email: clientEmail }),
      databaseURL,
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');
    return app;
  } catch (err) {
    console.error('❌ Firebase Admin initialization error:', err);
    return null;
  }
};

const firebaseApp = initializeFirebase();

module.exports = { admin, db, firebaseApp };
