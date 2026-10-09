'use strict';

const conversationService = require('../services/conversation.service');
const { validate } = require('../utils/validate');
const { success } = require('../utils/response');

const MAX_MESSAGE_LENGTH = 8000; // global JSON body limit is 10kb

const conversationSpec = {
  title: { type: 'string', maxLength: 200 },
  archived: { type: 'boolean' },
  isFavorite: { type: 'boolean' },
};

const messageSpec = {
  content: { type: 'string', required: true, maxLength: MAX_MESSAGE_LENGTH },
  isSearch: { type: 'boolean' },
  isDeepResearch: { type: 'boolean' },
  isCriticalAnalysis: { type: 'boolean' },
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
  const { content, ...flags } = validate(req.body, messageSpec);
  const metadata = Object.fromEntries(Object.entries(flags).filter(([, v]) => v === true));
  const result = await conversationService.sendMessage(req.user.uid, req.params.id, { content, metadata });
  return success(res, result, 201);
};

const editMessage = async (req, res) => {
  const data = validate(req.body, editSpec);
  return success(res, await conversationService.editMessage(req.user.uid, req.params.id, req.params.messageId, data));
};

const regenerateMessage = async (req, res) =>
  success(res, await conversationService.regenerateMessage(req.user.uid, req.params.id, req.params.messageId), 201);

module.exports = { list, get, create, update, remove, listMessages, sendMessage, editMessage, regenerateMessage };
