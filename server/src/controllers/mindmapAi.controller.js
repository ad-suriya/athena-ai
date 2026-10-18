'use strict';

const mindmapAi = require('../services/mindmapAi.service');
const { validate } = require('../utils/validate');
const { validationFailed } = require('../utils/errors');
const { success } = require('../utils/response');
const { isValidTimeZone } = require('./conversations.controller');

// userId always comes from the verified token (req.user); node ids are checked
// against that user's saved map by the service.

const nodeId = { type: 'number', min: 1 };
const timeZone = { type: 'string', maxLength: 64 };

const specs = {
  generate: { prompt: { type: 'string', required: true, maxLength: 2000 }, anchorId: { ...nodeId, nullable: true }, timeZone },
  expand: { nodeId: { ...nodeId, required: true }, instructions: { type: 'string', maxLength: 500 }, timeZone },
  connections: { nodeId, focus: { type: 'enum', values: ['related', 'dependencies'] } },
  plan: { nodeId: { ...nodeId, required: true }, mode: { type: 'enum', values: Object.keys(mindmapAi.PLAN_MODES) }, timeZone },
  ask: {
    nodeId: { ...nodeId, required: true },
    action: { type: 'enum', values: ['ask', ...Object.keys(mindmapAi.ASK_ACTIONS)] },
    question: { type: 'string', maxLength: 2000 },
    timeZone,
  },
};

const checked = (body, spec) => {
  const data = validate(body, spec);
  for (const field of ['nodeId', 'anchorId']) {
    if (data[field] != null && !Number.isInteger(data[field])) throw validationFailed({ [field]: 'Must be a node id (positive integer)' });
  }
  if (data.timeZone !== undefined && !isValidTimeZone(data.timeZone)) throw validationFailed({ timeZone: 'Unknown time zone' });
  return data;
};

const generate = async (req, res) => success(res, await mindmapAi.generateMap(req.user.uid, checked(req.body, specs.generate)));

const expand = async (req, res) => success(res, await mindmapAi.expandNode(req.user.uid, checked(req.body, specs.expand)));

const connections = async (req, res) => success(res, await mindmapAi.suggestConnections(req.user.uid, checked(req.body, specs.connections)));

const plan = async (req, res) => success(res, await mindmapAi.planFromNode(req.user.uid, checked(req.body, specs.plan)));

// The plan is validated in full by the service (agent/mindmapProposals validateExecution).
const execute = async (req, res) => success(res, await mindmapAi.executePlan(req.user.uid, req.body));

const ask = async (req, res) => {
  const data = checked(req.body, specs.ask);
  if ((data.action ?? 'ask') === 'ask' && !data.question?.trim()) throw validationFailed({ question: 'Required' });
  return success(res, await mindmapAi.askAboutNode(req.user.uid, data));
};

const linkedTasks = async (req, res) => success(res, await mindmapAi.getLinkedTasks(req.user.uid));

module.exports = { generate, expand, connections, plan, execute, ask, linkedTasks };
