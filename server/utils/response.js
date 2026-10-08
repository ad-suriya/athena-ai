'use strict';

const success = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const list = (res, data, meta = {}) =>
  res.status(200).json({ success: true, data, meta });

const error = (res, code, message, status = 400) =>
  res.status(status).json({ success: false, error: { code, message } });

const validationError = (res, message, fields = {}) =>
  res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message, fields } });

const notFound = (res, message = 'Resource not found') =>
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message } });

const unauthorized = (res, message = 'Unauthorized') =>
  res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message } });

const serverError = (res, message = 'Internal server error', detail = undefined) =>
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message,
      ...(detail ? { detail } : {}),
    },
  });

module.exports = { success, list, error, validationError, notFound, unauthorized, serverError };
