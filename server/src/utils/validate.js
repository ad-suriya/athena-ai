'use strict';

const { validationFailed } = require('./errors');

// Minimal schema validator — avoids adding a validation dependency.
//
// spec: { fieldName: { type, required, maxLength, min, max, values, maxItems, nullable } }
// types: 'string' | 'boolean' | 'number' | 'enum' | 'stringArray' | 'date'
//
// Unknown fields are dropped. With { partial: true } (PATCH), required is ignored
// but at least one known field must be present.
// Throws a 422 VALIDATION_ERROR with per-field messages; returns the cleaned object.
const validate = (body, spec, { partial = false } = {}) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationFailed({ body: 'Request body must be a JSON object' });
  }

  const value = {};
  const fields = {};

  for (const [name, rule] of Object.entries(spec)) {
    const raw = body[name];

    if (raw === undefined) {
      if (rule.required && !partial) fields[name] = 'Required';
      continue;
    }

    if (raw === null) {
      if (rule.nullable) value[name] = null;
      else fields[name] = 'Must not be null';
      continue;
    }

    const error = checkRule(raw, rule);
    if (error) {
      fields[name] = error;
    } else {
      value[name] = rule.type === 'date' ? new Date(raw) : raw;
    }
  }

  if (partial && Object.keys(value).length === 0 && Object.keys(fields).length === 0) {
    fields.body = `Provide at least one of: ${Object.keys(spec).join(', ')}`;
  }

  if (Object.keys(fields).length > 0) throw validationFailed(fields);
  return value;
};

const checkRule = (raw, rule) => {
  switch (rule.type) {
    case 'string':
      if (typeof raw !== 'string') return 'Must be a string';
      if (rule.required && !raw.trim()) return 'Must not be empty';
      if (rule.maxLength && raw.length > rule.maxLength) return `Must be at most ${rule.maxLength} characters`;
      return null;
    case 'boolean':
      return typeof raw === 'boolean' ? null : 'Must be a boolean';
    case 'number':
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return 'Must be a number';
      if (rule.min !== undefined && raw < rule.min) return `Must be at least ${rule.min}`;
      if (rule.max !== undefined && raw > rule.max) return `Must be at most ${rule.max}`;
      return null;
    case 'enum':
      return rule.values.includes(raw) ? null : `Must be one of: ${rule.values.join(', ')}`;
    case 'stringArray':
      if (!Array.isArray(raw) || raw.some((s) => typeof s !== 'string')) return 'Must be an array of strings';
      if (rule.maxItems && raw.length > rule.maxItems) return `Must have at most ${rule.maxItems} items`;
      if (rule.maxLength && raw.some((s) => s.length > rule.maxLength)) return `Items must be at most ${rule.maxLength} characters`;
      return null;
    case 'date':
      if (typeof raw !== 'string' || Number.isNaN(Date.parse(raw))) return 'Must be an ISO 8601 date string';
      return null;
    default:
      throw new Error(`Unknown validation type: ${rule.type}`);
  }
};

module.exports = { validate };
