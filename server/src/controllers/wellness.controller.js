'use strict';

const wellnessService = require('../services/wellness.service');
const { validate } = require('../utils/validate');
const { validationFailed } = require('../utils/errors');
const { success } = require('../utils/response');

const METRICS = ['mood', 'energy', 'stress', 'sleepHours'];

const entrySpec = {
  mood: { type: 'number', min: 1, max: 10, nullable: true },
  energy: { type: 'number', min: 1, max: 10, nullable: true },
  stress: { type: 'number', min: 1, max: 10, nullable: true },
  sleepHours: { type: 'number', min: 0, max: 24, nullable: true },
  note: { type: 'string', maxLength: 5000 },
  recordedAt: { type: 'date' },
};

const rangeSpec = {
  from: { type: 'date' },
  to: { type: 'date' },
};

const list = async (req, res) => {
  const range = Object.keys(req.query).length > 0 ? validate(req.query, rangeSpec, { partial: true }) : {};
  return success(res, await wellnessService.getEntries(req.user.uid, range));
};

const get = async (req, res) => success(res, await wellnessService.getEntry(req.user.uid, req.params.id));

const create = async (req, res) => {
  const data = validate(req.body, entrySpec);
  if (!METRICS.some((m) => data[m] !== undefined && data[m] !== null)) {
    throw validationFailed({ body: `Provide at least one of: ${METRICS.join(', ')}` });
  }
  return success(res, await wellnessService.createEntry(req.user.uid, data), 201);
};

const update = async (req, res) => {
  const data = validate(req.body, entrySpec, { partial: true });
  return success(res, await wellnessService.updateEntry(req.user.uid, req.params.id, data));
};

const remove = async (req, res) => {
  await wellnessService.deleteEntry(req.user.uid, req.params.id);
  return success(res, { id: req.params.id });
};

module.exports = { list, get, create, update, remove, entrySpec };
