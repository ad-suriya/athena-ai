'use strict';

const taskService = require('../services/task.service');
const { validate } = require('../utils/validate');
const { success } = require('../utils/response');

const taskSpec = {
  title: { type: 'string', required: true, maxLength: 500 },
  description: { type: 'string', maxLength: 5000 },
  status: { type: 'enum', values: taskService.TASK_STATUSES },
  priority: { type: 'enum', values: taskService.TASK_PRIORITIES },
  dueDate: { type: 'date', nullable: true },
  category: { type: 'string', maxLength: 100 },
  tags: { type: 'stringArray', maxItems: 20, maxLength: 100 },
  icon: { type: 'string', maxLength: 50 },
};

// userId always comes from the verified token (req.user), never from the request body.

const list = async (req, res) => success(res, await taskService.getTasks(req.user.uid));

const get = async (req, res) => success(res, await taskService.getTask(req.user.uid, req.params.id));

const create = async (req, res) => {
  const data = validate(req.body, taskSpec);
  return success(res, await taskService.createTask(req.user.uid, data), 201);
};

const update = async (req, res) => {
  const data = validate(req.body, taskSpec, { partial: true });
  return success(res, await taskService.updateTask(req.user.uid, req.params.id, data));
};

const remove = async (req, res) => {
  await taskService.deleteTask(req.user.uid, req.params.id);
  return success(res, { id: req.params.id });
};

module.exports = { list, get, create, update, remove };
