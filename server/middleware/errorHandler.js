'use strict';

const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  const detail = env.nodeEnv === 'development' ? err.message : undefined;

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal server error',
      ...(detail ? { detail } : {}),
    },
  });
};

module.exports = { errorHandler };
