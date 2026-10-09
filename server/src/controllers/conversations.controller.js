'use strict';

const conversationService = require('../services/conversation.service');
const { validate } = require('../utils/validate');
const { validationFailed } = require('../utils/errors');
const { success } = require('../utils/response');

const MAX_MESSAGE_LENGTH = 8000;

// Files sent to Gemini with a message (see app.js for the body size limit).
const ATTACHMENT_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
  'application/pdf', 'text/plain', 'text/markdown', 'text/csv',
];
const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

const conversationSpec = {
  title: { type: 'string', maxLength: 200 },
  archived: { type: 'boolean' },
  isFavorite: { type: 'boolean' },
};

const messageSpec = {
  content: { type: 'string', required: true, maxLength: MAX_MESSAGE_LENGTH },
  search: { type: 'boolean' },
  timeZone: { type: 'string', maxLength: 64 },
  // Older clients' flags; isSearch also turns on search.
  isSearch: { type: 'boolean' },
  isDeepResearch: { type: 'boolean' },
  isCriticalAnalysis: { type: 'boolean' },
};

const ratingSpec = {
  rating: { type: 'enum', values: ['up', 'down'], required: true, nullable: true },
};

const isValidTimeZone = (tz) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// → [{ name, mimeType, data, size }] or throws 422.
const validateAttachments = (raw) => {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > MAX_ATTACHMENTS) {
    throw validationFailed({ attachments: `Must be an array of at most ${MAX_ATTACHMENTS} files` });
  }
  let total = 0;
  const files = raw.map((f, i) => {
    const field = `attachments[${i}]`;
    if (!f || typeof f.name !== 'string' || !f.name.trim() || f.name.length > 200) throw validationFailed({ [field]: 'Needs a file name' });
    if (!ATTACHMENT_TYPES.includes(f.mimeType)) throw validationFailed({ [field]: 'Supported files: images (PNG, JPEG, WebP, HEIC), PDF, and text' });
    if (typeof f.data !== 'string' || !f.data || !BASE64.test(f.data)) throw validationFailed({ [field]: 'data must be base64' });
    const size = Math.floor((f.data.length * 3) / 4) - (f.data.endsWith('==') ? 2 : f.data.endsWith('=') ? 1 : 0);
    if (size > MAX_ATTACHMENT_BYTES) throw validationFailed({ [field]: 'Each file must be 5 MB or smaller' });
    total += size;
    return { name: f.name.trim(), mimeType: f.mimeType, data: f.data, size };
  });
  if (total > MAX_TOTAL_ATTACHMENT_BYTES) throw validationFailed({ attachments: 'Files must total 10 MB or less' });
  return files;
};

const editSpec = {
  content: { type: 'string', required: true, maxLength: MAX_MESSAGE_LENGTH },
};

const list = async (req, res) => success(res, await conversationService.getConversations(req.user.uid));

const get = async (req, res) => success(res, await conversationService.getConversation(req.user.uid, req.params.id));

const create = async (req, res) => {
  const data = validate(req.body, conversationSpec);
  return success(res, await conversationService.createConversation(req.user.uid, data), 201);
};

const update = async (req, res) => {
  const data = validate(req.body, conversationSpec, { partial: true });
  return success(res, await conversationService.updateConversation(req.user.uid, req.params.id, data));
};

const remove = async (req, res) => {
  await conversationService.deleteConversation(req.user.uid, req.params.id);
  return success(res, { id: req.params.id });
};

const listMessages = async (req, res) =>
  success(res, await conversationService.getMessages(req.user.uid, req.params.id));

const sendMessage = async (req, res) => {
  const { content, timeZone, ...flags } = validate(req.body, messageSpec);
  if (timeZone !== undefined && !isValidTimeZone(timeZone)) throw validationFailed({ timeZone: 'Unknown time zone' });
  const attachments = validateAttachments(req.body.attachments);
  if (flags.isSearch) flags.search = true;
  const metadata = Object.fromEntries(Object.entries(flags).filter(([, v]) => v === true));
  const result = await conversationService.sendMessage(req.user.uid, req.params.id, { content, metadata, attachments, timeZone });
  return success(res, result, 201);
};

const rateMessage = async (req, res) => {
  const data = validate(req.body, ratingSpec);
  return success(res, await conversationService.rateMessage(req.user.uid, req.params.id, req.params.messageId, data));
};

const editMessage = async (req, res) => {
  const data = validate(req.body, editSpec);
  return success(res, await conversationService.editMessage(req.user.uid, req.params.id, req.params.messageId, data));
};

const regenerateMessage = async (req, res) =>
  success(res, await conversationService.regenerateMessage(req.user.uid, req.params.id, req.params.messageId), 201);

module.exports = { list, get, create, update, remove, listMessages, sendMessage, editMessage, rateMessage, regenerateMessage };
