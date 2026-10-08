'use strict';

const calendarService = require('../services/calendar.service');
const { validate } = require('../utils/validate');
const { success } = require('../utils/response');

const eventSpec = {
  title: { type: 'string', required: true, maxLength: 500 },
  description: { type: 'string', maxLength: 5000 },
  startTime: { type: 'date', required: true },
  endTime: { type: 'date', nullable: true },
  location: { type: 'string', maxLength: 500 },
  color: { type: 'string', maxLength: 30 },
  category: { type: 'string', maxLength: 100 },
  allDay: { type: 'boolean' },
};

const rangeSpec = {
  from: { type: 'date' },
  to: { type: 'date' },
};

const list = async (req, res) => {
  const range = Object.keys(req.query).length > 0 ? validate(req.query, rangeSpec, { partial: true }) : {};
  return success(res, await calendarService.getEvents(req.user.uid, range));
};

const get = async (req, res) => success(res, await calendarService.getEvent(req.user.uid, req.params.id));

const create = async (req, res) => {
  const data = validate(req.body, eventSpec);
  return success(res, await calendarService.createEvent(req.user.uid, data), 201);
};

const update = async (req, res) => {
  const data = validate(req.body, eventSpec, { partial: true });
  return success(res, await calendarService.updateEvent(req.user.uid, req.params.id, data));
};

const remove = async (req, res) => {
  await calendarService.deleteEvent(req.user.uid, req.params.id);
  return success(res, { id: req.params.id });
};

module.exports = { list, get, create, update, remove };
