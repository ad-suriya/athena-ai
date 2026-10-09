'use strict';

const insightsService = require('../services/insights.service');
const { validationFailed } = require('../utils/errors');
const { success } = require('../utils/response');

// GET /api/insights/activity?month=YYYY-MM&tzOffset=-330
const activity = async (req, res) => {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(req.query.month || '');
  if (!match) throw validationFailed({ month: 'Must be YYYY-MM' });
  const tzOffset = req.query.tzOffset === undefined ? 0 : Number(req.query.tzOffset);
  if (!Number.isInteger(tzOffset) || Math.abs(tzOffset) > 14 * 60) {
    throw validationFailed({ tzOffset: 'Must be minutes between -840 and 840' });
  }
  return success(res, await insightsService.getMonthActivity(req.user.uid, {
    year: Number(match[1]), month: Number(match[2]), tzOffset,
  }));
};

module.exports = { activity };
