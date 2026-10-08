'use strict';

// Errors thrown from services/controllers. The error handler turns these into
// the standard { success: false, error: { code, message, fields? } } response.
class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.expose = true; // message is safe to send to the client
  }
}

const notFoundError = (message = 'Resource not found') =>
  new AppError(404, 'RESOURCE_NOT_FOUND', message);

const validationFailed = (fields, message = 'Invalid request') =>
  new AppError(422, 'VALIDATION_ERROR', message, fields);

const serviceUnavailable = (message = 'Service unavailable') =>
  new AppError(503, 'SERVICE_UNAVAILABLE', message);

module.exports = { AppError, notFoundError, validationFailed, serviceUnavailable };
