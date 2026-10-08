'use strict';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Malformed JSON / body too large from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large' } });
  }

  const status = err.status || 500;

  // Only AppError messages are client-safe. Anything else (Firestore, Vertex, bugs)
  // is logged server-side and returned as a generic message.
  if (!err.expose) {
    console.error('Unhandled error:', err);
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error' },
    });
  }

  return res.status(status).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      ...(err.fields ? { fields: err.fields } : {}),
    },
  });
};

module.exports = { errorHandler };
