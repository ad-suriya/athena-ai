'use strict';

const userService = require('../services/user.service');
const { success } = require('../utils/response');
const { validate } = require('../utils/validate');

const settingsSpec = {
  memoryEnabled: { type: 'boolean' },
};

// GET /api/users/me — profile and stats for the authenticated user only.
const me = async (req, res) => success(res, await userService.getProfile(req.user));

// PATCH /api/users/me/settings — { memoryEnabled }. Turning memory off deletes it.
const updateSettings = async (req, res) => {
  const data = validate(req.body, settingsSpec, { partial: true });
  return success(res, await userService.updateSettings(req.user.uid, data));
};

module.exports = { me, updateSettings, settingsSpec };
