'use strict';

const journalService = require('../services/journal.service');
const { validate } = require('../utils/validate');
const { success } = require('../utils/response');

const entrySpec = {
  title: { type: 'string', maxLength: 500 },
  content: { type: 'string', required: true, maxLength: 9000 },
  mood: { type: 'string', maxLength: 50 },
  tags: { type: 'stringArray', maxItems: 20, maxLength: 100 },
};

const list = async (req, res) => success(res, await journalService.getEntries(req.user.uid));

const get = async (req, res) => success(res, await journalService.getEntry(req.user.uid, req.params.id));

const create = async (req, res) => {
  const data = validate(req.body, entrySpec);
  return success(res, await journalService.createEntry(req.user.uid, data), 201);
};

const update = async (req, res) => {
  const data = validate(req.body, entrySpec, { partial: true });
  return success(res, await journalService.updateEntry(req.user.uid, req.params.id, data));
};

const remove = async (req, res) => {
  await journalService.deleteEntry(req.user.uid, req.params.id);
  return success(res, { id: req.params.id });
};

module.exports = { list, get, create, update, remove };
