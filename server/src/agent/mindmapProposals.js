'use strict';

// Validation for the mind map AI features. Gemini returns JSON in a fixed schema, but
// nothing it returns is trusted: every proposal is checked and cleaned here before the
// user sees it, and the plan the user approves is checked again before anything runs.
//
//   validateMapProposal     new nodes (generate a map, add a branch, expand a node)
//   validateConnections     suggested links between existing nodes
//   validateTaskPlan        tasks (and optional calendar slots) planned from a node
//   validateExecution       the edited plan the user approved, before it is executed

const { AppError, validationFailed } = require('../utils/errors');
const { validate } = require('../utils/validate');
const { CONNECTION_TYPES, MAX_NODES: MAX_MAP_NODES } = require('../services/mindmap.service');
const { TASK_PRIORITIES: PRIORITIES } = require('../services/task.service');
const { buildIndex, ancestorsOf, childrenOf, normalizeTitle } = require('./mindmapContext');

const STRENGTHS = ['likely', 'possible'];
const MAX_PLAN_TASKS = 12;
const MAX_EVENT_HOURS = 8;
const KEY_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const DAY_MS = 86400000;

const invalidOutput = () => new AppError(502, 'AI_INVALID_OUTPUT', 'Athena’s suggestion came back in an unexpected format. Please try again.');

// Single line, no control characters, at most `max` characters.
const cleanText = (value, max) => (typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
  : '');

// Model JSON text → object, or null. Tolerates a ```json fence.
const parseModelJson = (text) => {
  if (typeof text !== 'string') return null;
  const body = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    const value = JSON.parse(body);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------- New nodes

// Gemini response schema for generated nodes. `parent` is another item's key, or ''
// for a top-level item (attached to the anchor node when adding to an existing map).
const MAP_SCHEMA = {
  type: 'OBJECT',
  properties: {
    nodes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          key: { type: 'STRING', description: 'Short unique id for this item, e.g. n1' },
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          parent: { type: 'STRING', description: 'key of the parent item, or empty for a top-level item' },
        },
        required: ['key', 'title', 'parent'],
      },
    },
  },
  required: ['nodes'],
};

// raw: parsed model output. map: the user's saved map. anchorId: existing node the new
// items hang from (null for a new, separate map). maxNodes: cap on new nodes.
//
// → { nodes: [{ ref, title, description, parent, similarTo? }], edges: [{ from, to }], dropped }
//   ref is a stable id for the proposal ('new-1', …); parent is a ref, an existing node
//   id, or null. similarTo flags a same-titled node elsewhere in the map.
//
// Duplicates are merged, not just dropped: an item matching a node that already sits
// in the same place (same parent, or the anchor and its ancestors) is not created, and
// its children attach to that existing node instead.
const validateMapProposal = (raw, { map, anchorId = null, maxNodes = 40 }) => {
  if (!raw || !Array.isArray(raw.nodes)) throw invalidOutput();
  const index = buildIndex(map);
  const room = Math.max(0, MAX_MAP_NODES - map.nodes.length);
  const limit = Math.min(maxNodes, room);
  const dropped = { duplicates: 0, invalid: 0, overLimit: 0 };

  // 1. Clean items; drop untitled ones and repeated keys.
  const items = [];
  const keys = new Set();
  for (const item of raw.nodes.slice(0, 200)) {
    const title = cleanText(item?.title, 120);
    const key = cleanText(String(item?.key ?? ''), 40);
    if (!title || !key || keys.has(key)) {
      dropped.invalid += 1;
      continue;
    }
    keys.add(key);
    items.push({ key, title, description: cleanText(item.description, 300), parentKey: cleanText(String(item.parent ?? ''), 40) });
  }

  const titleOf = (target) => (target.kind === 'existing' ? index.byId.get(target.id)?.title : out.find((n) => n.ref === target.ref)?.title);
  const placeKey = (target) => (target ? `${target.kind}:${target.id ?? target.ref}` : 'root');
  const root = anchorId === null ? null : { kind: 'existing', id: anchorId };
  // The anchor and its ancestors: a new item with one of their titles is the same idea.
  const lineage = new Map((anchorId === null ? [] : [anchorId, ...ancestorsOf(index, anchorId)])
    .map((id) => [normalizeTitle(index.byId.get(id).title), id]));
  const anywhere = new Map(map.nodes.map((n) => [normalizeTitle(n.title), n]));

  const out = [];
  const resolved = new Map(); // item key → target ({ kind: 'new', ref } | { kind: 'existing', id }) or 'dropped'
  const usedPlaces = new Map(); // `${place}|${title}` → target

  // 2. Place items parent-first. Items whose parent never resolves are part of a cycle.
  let pending = items;
  while (pending.length) {
    const next = [];
    for (const item of pending) {
      const hasParent = item.parentKey && keys.has(item.parentKey);
      if (hasParent && !resolved.has(item.parentKey)) {
        next.push(item);
        continue;
      }
      const parent = hasParent ? resolved.get(item.parentKey) : root;
      if (parent === 'dropped') {
        resolved.set(item.key, 'dropped');
        dropped.overLimit += 1;
        continue;
      }
      const norm = normalizeTitle(item.title);
      const place = `${placeKey(parent)}|${norm}`;
      const existingChild = parent?.kind === 'existing'
        && childrenOf(index, parent.id).find((id) => normalizeTitle(index.byId.get(id).title) === norm);
      const same = usedPlaces.get(place)
        || (existingChild && { kind: 'existing', id: existingChild })
        || (lineage.has(norm) && { kind: 'existing', id: lineage.get(norm) })
        || (parent && normalizeTitle(titleOf(parent)) === norm && parent);
      if (same) {
        resolved.set(item.key, same);
        dropped.duplicates += 1;
        continue;
      }
      if (out.length >= limit) {
        resolved.set(item.key, 'dropped');
        dropped.overLimit += 1;
        continue;
      }
      const ref = `new-${out.length + 1}`;
      const similar = anywhere.get(norm);
      out.push({
        ref,
        title: item.title,
        description: item.description,
        parent: parent ? (parent.kind === 'existing' ? parent.id : parent.ref) : null,
        ...(similar ? { similarTo: { id: similar.id, title: similar.title } } : {}),
      });
      const target = { kind: 'new', ref };
      resolved.set(item.key, target);
      usedPlaces.set(place, target);
    }
    if (next.length === pending.length) {
      dropped.invalid += next.length;
      break;
    }
    pending = next;
  }

  return {
    nodes: out,
    edges: out.filter((n) => n.parent !== null).map((n) => ({ from: n.parent, to: n.ref })),
    dropped,
  };
};

// ---------------------------------------------------------------- Connections

const CONNECTIONS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    connections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          from: { type: 'INTEGER' },
          to: { type: 'INTEGER' },
          type: { type: 'STRING', enum: CONNECTION_TYPES },
          reason: { type: 'STRING' },
          strength: { type: 'STRING', enum: STRENGTHS },
        },
        required: ['from', 'to', 'type', 'reason', 'strength'],
      },
    },
  },
  required: ['connections'],
};

// candidateIds: the node ids the model was shown (suggestions must stay inside them).
// → { connections: [{ from, to, type, reason, strength }], rejected }
// Rejects self-links, unknown endpoints, pairs already connected (either direction)
// and repeated pairs.
const validateConnections = (raw, { map, candidateIds, max = 8 }) => {
  if (!raw || !Array.isArray(raw.connections)) throw invalidOutput();
  const allowed = new Set(candidateIds);
  const pair = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const taken = new Set(map.connections.map((c) => pair(c.from, c.to)));
  const out = [];
  let rejected = 0;
  for (const s of raw.connections.slice(0, 50)) {
    const from = Number(s?.from);
    const to = Number(s?.to);
    const reason = cleanText(s?.reason, 200);
    const ok = Number.isInteger(from) && Number.isInteger(to) && from !== to
      && allowed.has(from) && allowed.has(to)
      && CONNECTION_TYPES.includes(s.type) && reason
      && !taken.has(pair(from, to));
    if (!ok || out.length >= max) {
      rejected += 1;
      continue;
    }
    taken.add(pair(from, to));
    out.push({ from, to, type: s.type, reason, strength: STRENGTHS.includes(s.strength) ? s.strength : 'possible' });
  }
  return { connections: out, rejected };
};

// ---------------------------------------------------------------- Task plans

const PLAN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    tasks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          key: { type: 'STRING' },
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          priority: { type: 'STRING', enum: PRIORITIES },
          dueDate: { type: 'STRING', description: 'Optional ISO 8601 date-time with offset' },
          dependsOn: { type: 'ARRAY', items: { type: 'STRING' }, description: 'keys of tasks to finish first' },
          startTime: { type: 'STRING', description: 'Schedule mode only: ISO 8601 start of a work session' },
          endTime: { type: 'STRING', description: 'Schedule mode only: ISO 8601 end of the session' },
        },
        required: ['key', 'title'],
      },
    },
  },
  required: ['tasks'],
};

// Schedule mode: every task must carry its session. Gemini otherwise tends to give
// only startTime, and a slot without an end can't be checked for conflicts.
const SCHEDULE_PLAN_SCHEMA = {
  ...PLAN_SCHEMA,
  properties: {
    tasks: {
      ...PLAN_SCHEMA.properties.tasks,
      items: { ...PLAN_SCHEMA.properties.tasks.items, required: ['key', 'title', 'startTime', 'endTime'] },
    },
  },
};
const DEFAULT_SESSION_MS = 60 * 60000;

const toDate = (value) => {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// existingTitles: normalized titles of the user's open tasks and the node's linked tasks.
// busy: [{ start: Date, end: Date }] from the calendar, for conflict warnings.
// → { tasks: [{ key, title, description, priority, dueDate, dependsOn }],
//     events: [{ key, taskKey, title, startTime, endTime, conflict }],
//     skipped: [{ title, reason }] }
const validateTaskPlan = (raw, { existingTitles = new Set(), busy = [], now = new Date(), schedule = false, max = MAX_PLAN_TASKS }) => {
  if (!raw || !Array.isArray(raw.tasks)) throw invalidOutput();
  const tasks = [];
  const events = [];
  const skipped = [];
  const seenTitles = new Set();
  const keys = new Set();
  const earliest = new Date(now.getTime() - DAY_MS);
  const latest = new Date(now.getTime() + 366 * DAY_MS);

  for (const t of raw.tasks.slice(0, 40)) {
    const title = cleanText(t?.title, 200);
    if (!title) continue;
    const norm = normalizeTitle(title);
    if (existingTitles.has(norm)) {
      skipped.push({ title, reason: 'You already have this task' });
      continue;
    }
    if (seenTitles.has(norm)) continue;
    if (tasks.length >= max) {
      skipped.push({ title, reason: 'Plan limit reached' });
      continue;
    }
    seenTitles.add(norm);
    let key = cleanText(String(t.key ?? ''), 40).replace(/[^A-Za-z0-9_-]/g, '');
    if (!key || keys.has(key)) key = `t${tasks.length + 1}`;
    keys.add(key);
    const due = toDate(t.dueDate);
    tasks.push({
      key,
      title,
      description: cleanText(t.description, 1000),
      priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium',
      dueDate: due && due >= earliest && due <= latest ? due.toISOString() : null,
      // Only earlier tasks, so the order is always a valid one (no cycles).
      dependsOn: Array.isArray(t.dependsOn) ? [...new Set(t.dependsOn.map(String))].filter((k) => k !== key && keys.has(k)) : [],
    });

    const start = schedule ? toDate(t.startTime) : null;
    // A session with a start but no end is assumed to last an hour.
    const end = schedule ? toDate(t.endTime) || (start && new Date(start.getTime() + DEFAULT_SESSION_MS)) : null;
    if (start && end && start >= now && start <= latest && end > start && end - start <= MAX_EVENT_HOURS * 3600000) {
      events.push({
        key: `ev-${key}`,
        taskKey: key,
        title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        conflict: busy.some((b) => start < b.end && end > b.start),
      });
    }
  }
  return { tasks, events, skipped };
};

// ---------------------------------------------------------------- Approved plans

const executionTaskSpec = {
  title: { type: 'string', required: true, maxLength: 500 },
  description: { type: 'string', maxLength: 5000 },
  priority: { type: 'enum', values: PRIORITIES },
  dueDate: { type: 'date', nullable: true },
};
const executionEventSpec = {
  title: { type: 'string', required: true, maxLength: 500 },
  startTime: { type: 'date', required: true },
  endTime: { type: 'date', required: true },
};

// The plan as approved (and possibly edited) by the user. Throws 422 on anything off.
// → { proposalId, nodeId, tasks: [{ key, dependsOn, data }], events: [{ key, taskKey, data }] }
const validateExecution = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw validationFailed({ body: 'Request body must be a JSON object' });
  const { proposalId, nodeId } = body;
  if (typeof proposalId !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(proposalId)) throw validationFailed({ proposalId: 'Invalid proposal id' });
  if (!Number.isInteger(nodeId) || nodeId <= 0) throw validationFailed({ nodeId: 'Must be a node id (positive integer)' });
  const rawTasks = body.tasks ?? [];
  const rawEvents = body.events ?? [];
  if (!Array.isArray(rawTasks) || rawTasks.length > MAX_PLAN_TASKS) throw validationFailed({ tasks: `Must be an array of at most ${MAX_PLAN_TASKS} tasks` });
  if (!Array.isArray(rawEvents) || rawEvents.length > MAX_PLAN_TASKS) throw validationFailed({ events: `Must be an array of at most ${MAX_PLAN_TASKS} events` });
  if (!rawTasks.length && !rawEvents.length) throw validationFailed({ tasks: 'Choose at least one task or event' });

  const keys = new Set();
  const checkKey = (key, field) => {
    if (typeof key !== 'string' || !KEY_PATTERN.test(key) || keys.has(key)) throw validationFailed({ [field]: 'Missing or repeated key' });
    keys.add(key);
  };

  const tasks = rawTasks.map((t, i) => {
    checkKey(t?.key, `tasks[${i}].key`);
    const { key, dependsOn = [], ...fields } = t;
    let data;
    try {
      data = validate(fields, executionTaskSpec);
    } catch (err) {
      throw validationFailed(Object.fromEntries(Object.entries(err.fields || {}).map(([k, v]) => [`tasks[${i}].${k}`, v])));
    }
    return { key, dependsOn: Array.isArray(dependsOn) ? dependsOn.filter((k) => typeof k === 'string') : [], data };
  });
  const taskKeys = new Set(tasks.map((t) => t.key));
  tasks.forEach((t) => { t.dependsOn = t.dependsOn.filter((k) => taskKeys.has(k) && k !== t.key); });

  const events = rawEvents.map((e, i) => {
    checkKey(e?.key, `events[${i}].key`);
    const { key, taskKey, ...fields } = e;
    let data;
    try {
      data = validate(fields, executionEventSpec);
    } catch (err) {
      throw validationFailed(Object.fromEntries(Object.entries(err.fields || {}).map(([k, v]) => [`events[${i}].${k}`, v])));
    }
    if (data.endTime <= data.startTime) throw validationFailed({ [`events[${i}].endTime`]: 'Must be after startTime' });
    return { key, taskKey: taskKeys.has(taskKey) ? taskKey : null, data };
  });

  return { proposalId, nodeId, tasks, events };
};

module.exports = {
  MAP_SCHEMA,
  CONNECTIONS_SCHEMA,
  PLAN_SCHEMA,
  SCHEDULE_PLAN_SCHEMA,
  parseModelJson,
  cleanText,
  validateMapProposal,
  validateConnections,
  validateTaskPlan,
  validateExecution,
};
