'use strict';

const feedbackService = require('../services/feedback.service');
const { validate } = require('../utils/validate');
const { success } = require('../utils/response');

const FEEDBACK_TYPES = ['bug', 'suggestion', 'harmful', 'inaccurate', 'unhelpful', 'other'];

const feedbackSpec = {
  type: { type: 'enum', values: FEEDBACK_TYPES, required: true },
  message: { type: 'string', required: true, maxLength: 5000 },
  email: { type: 'string', maxLength: 320 },
};

const contextSpec = {
  page: { type: 'string', maxLength: 100 },
  conversationId: { type: 'string', maxLength: 128 },
  messageId: { type: 'string', maxLength: 128 },
};

// POST /api/feedback — context (optional) says where it was sent from.
const create = async (req, res) => {
  const data = validate(req.body, feedbackSpec);
  const context = req.body.context && typeof req.body.context === 'object' && !Array.isArray(req.body.context)
    ? validate(req.body.context, contextSpec, { partial: Object.keys(req.body.context).length > 0 })
    : {};
  return success(res, await feedbackService.createFeedback(req.user.uid, { ...data, context }), 201);
};

module.exports = { create, FEEDBACK_TYPES };
