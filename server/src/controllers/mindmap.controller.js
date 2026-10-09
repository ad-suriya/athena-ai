'use strict';

const mindmapService = require('../services/mindmap.service');
const { validationFailed } = require('../utils/errors');
const { success } = require('../utils/response');

const get = async (req, res) => success(res, await mindmapService.getMap(req.user.uid));

// PUT replaces the whole map; the service validates nodes and connections.
const save = async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationFailed({ body: 'Request body must be a JSON object' });
  }
  return success(res, await mindmapService.saveMap(req.user.uid, { nodes: body.nodes, connections: body.connections }));
};

module.exports = { get, save };
