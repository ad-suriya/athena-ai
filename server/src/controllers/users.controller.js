'use strict';

const userService = require('../services/user.service');
const { success } = require('../utils/response');

// GET /api/users/me — profile and stats for the authenticated user only.
const me = async (req, res) => success(res, await userService.getProfile(req.user));

module.exports = { me };
