'use strict';

const noteService = require('../services/note.service');
const { validate } = require('../utils/validate');
const { success } = require('../utils/response');

// Firestore documents are limited to 1 MiB; leave headroom for the other fields.
const MAX_CONTENT_LENGTH = 900 * 1024;

const noteSpec = {
  title: { type: 'string', maxLength: 500 },
  content: { type: 'string', maxLength: MAX_CONTENT_LENGTH },
  tags: { type: 'stringArray', maxItems: 20, maxLength: 100 },
  color: { type: 'string', maxLength: 30 },
  isPinned: { type: 'boolean' },
};

const list = async (req, res) => success(res, await noteService.getNotes(req.user.uid));

const get = async (req, res) => success(res, await noteService.getNote(req.user.uid, req.params.id));

const create = async (req, res) => {
  const data = validate(req.body, noteSpec);
  return success(res, await noteService.createNote(req.user.uid, data), 201);
};

const update = async (req, res) => {
  const data = validate(req.body, noteSpec, { partial: true });
  return success(res, await noteService.updateNote(req.user.uid, req.params.id, data));
};

const remove = async (req, res) => {
  await noteService.deleteNote(req.user.uid, req.params.id);
  return success(res, { id: req.params.id });
};

module.exports = { list, get, create, update, remove, noteSpec };
