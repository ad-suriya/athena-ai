'use strict';

// Tools Athena can call from chat (Gemini function calling). Each tool validates its
// arguments with the same spec as the REST API, then calls the same service, so the
// AI can do exactly what the user can do in the app — no more.
//
// tool: { declaration (Gemini FunctionDeclaration), run(userId, args) → { result, action? } }
// `action` is a one-line description of a change, shown under the reply.

const taskService = require('../services/task.service');
const noteService = require('../services/note.service');
const calendarService = require('../services/calendar.service');
const wellnessService = require('../services/wellness.service');
const mindmapService = require('../services/mindmap.service');
const { validate } = require('../utils/validate');
const { validationFailed } = require('../utils/errors');
const { taskSpec } = require('../controllers/tasks.controller');
const { noteSpec } = require('../controllers/notes.controller');
const { eventSpec } = require('../controllers/calendar.controller');
const { entrySpec } = require('../controllers/wellness.controller');

const S = { type: 'STRING' };
const N = { type: 'NUMBER' };
const I = { type: 'INTEGER' };
const str = (description) => ({ ...S, description });
const num = (description) => ({ ...N, description });
const int = (description) => ({ ...I, description });
const obj = (properties, required = []) => ({ type: 'OBJECT', properties, required });

const ISO = 'ISO 8601 date-time with the user\'s UTC offset, e.g. 2026-10-09T15:00:00+05:30';

// Journal entries are rich text (HTML) in the editor.
const escapeHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textToHtml = (text) => text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
const htmlToText = (html = '') => html
  .replace(/<\/(p|h[1-6]|li|div)>|<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text);

// Drops undefined keys so partial updates only touch what the model gave.
const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const requireId = (args, name = 'id') => {
  if (typeof args[name] !== 'string' || !args[name]) throw validationFailed({ [name]: 'Required' });
  return args[name];
};
const requireNodeId = (value, name = 'id') => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw validationFailed({ [name]: 'Must be a node id (positive integer)' });
  return id;
};

const taskView = (t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate, description: t.description || undefined });
const eventView = (e) => ({ id: e.id, title: e.title, startTime: e.startTime, endTime: e.endTime, location: e.location || undefined, description: e.description || undefined });
const moodView = (w) => ({ id: w.id, recordedAt: w.recordedAt, mood: w.mood, energy: w.energy, stress: w.stress, sleepHours: w.sleepHours, note: w.note || undefined });

const tools = {
  // ---------------- Tasks ----------------
  list_tasks: {
    declaration: {
      description: 'List the user\'s tasks (to-dos). Use to find a task\'s id before changing it.',
      parameters: obj({ status: { ...S, enum: taskService.TASK_STATUSES, description: 'Only tasks with this status' } }),
    },
    run: async (userId, { status }) => {
      const tasks = await taskService.getTasks(userId);
      return { result: { tasks: tasks.filter((t) => !status || t.status === status).map(taskView) } };
    },
  },
  create_task: {
    declaration: {
      description: 'Add a task to the user\'s task list.',
      parameters: obj({
        title: str('Short task title'),
        description: str('Optional details'),
        priority: { ...S, enum: taskService.TASK_PRIORITIES },
        dueDate: str(`Optional due date, ${ISO}`),
      }, ['title']),
    },
    run: async (userId, args) => {
      const task = await taskService.createTask(userId, validate(defined(args), taskSpec));
      return { result: { task: taskView(task) }, action: `Added task “${task.title}”` };
    },
  },
  update_task: {
    declaration: {
      description: 'Change a task: rename, edit details, change priority or due date, or mark it done (status "completed") or not done ("todo").',
      parameters: obj({
        id: str('Task id from list_tasks'),
        title: S, description: S,
        status: { ...S, enum: taskService.TASK_STATUSES },
        priority: { ...S, enum: taskService.TASK_PRIORITIES },
        dueDate: str(`${ISO}, or empty string to clear`),
      }, ['id']),
    },
    run: async (userId, { id, ...args }) => {
      if (args.dueDate === '') args.dueDate = null;
      const task = await taskService.updateTask(userId, requireId({ id }), validate(defined(args), taskSpec, { partial: true }));
      const what = args.status === 'completed' ? 'Completed' : args.status === 'todo' ? 'Reopened' : 'Updated';
      return { result: { task: taskView(task) }, action: `${what} task “${task.title}”` };
    },
  },
  delete_task: {
    declaration: { description: 'Delete a task permanently.', parameters: obj({ id: str('Task id from list_tasks') }, ['id']) },
    run: async (userId, args) => {
      const id = requireId(args);
      const task = await taskService.getTask(userId, id);
      await taskService.deleteTask(userId, id);
      return { result: { deleted: id }, action: `Deleted task “${task.title}”` };
    },
  },

  // ---------------- Journal (notes collection; the Journal page) ----------------
  list_journal_entries: {
    declaration: {
      description: 'List the user\'s journal entries (newest first) with a short preview. Optional text search.',
      parameters: obj({ query: str('Only entries whose title or text contains this') }),
    },
    run: async (userId, { query }) => {
      const notes = await noteService.getNotes(userId);
      const q = (query || '').toLowerCase();
      const entries = notes
        .map((n) => ({ id: n.id, title: n.title, text: htmlToText(n.content), updatedAt: n.updatedAt, createdAt: n.createdAt }))
        .filter((n) => !q || `${n.title} ${n.text}`.toLowerCase().includes(q))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 30)
        .map((n) => ({ ...n, text: clip(n.text, 200) }));
      return { result: { entries } };
    },
  },
  read_journal_entry: {
    declaration: { description: 'Read the full text of one journal entry.', parameters: obj({ id: str('Entry id') }, ['id']) },
    run: async (userId, args) => {
      const n = await noteService.getNote(userId, requireId(args));
      return { result: { id: n.id, title: n.title, text: clip(htmlToText(n.content), 8000), createdAt: n.createdAt, updatedAt: n.updatedAt } };
    },
  },
  create_journal_entry: {
    declaration: {
      description: 'Write a new journal entry. Use plain text; blank lines separate paragraphs.',
      parameters: obj({ title: S, text: str('Entry body as plain text') }, ['title', 'text']),
    },
    run: async (userId, { title, text = '' }) => {
      const note = await noteService.createNote(userId, validate({ title, content: textToHtml(text) }, noteSpec));
      return { result: { id: note.id, title: note.title }, action: `Wrote journal entry “${note.title}”` };
    },
  },
  update_journal_entry: {
    declaration: {
      description: 'Edit a journal entry: rename it, replace its text, or append text to the end.',
      parameters: obj({ id: S, title: S, text: str('New full text (replaces the body)'), appendText: str('Text to add at the end') }, ['id']),
    },
    run: async (userId, { id, title, text, appendText }) => {
      const current = await noteService.getNote(userId, requireId({ id }));
      const content = text !== undefined ? textToHtml(text)
        : appendText !== undefined ? `${current.content || ''}${textToHtml(appendText)}` : undefined;
      const note = await noteService.updateNote(userId, id, validate(defined({ title, content }), noteSpec, { partial: true }));
      return { result: { id: note.id, title: note.title }, action: `Updated journal entry “${note.title}”` };
    },
  },
  delete_journal_entry: {
    declaration: { description: 'Delete a journal entry permanently.', parameters: obj({ id: S }, ['id']) },
    run: async (userId, args) => {
      const id = requireId(args);
      const note = await noteService.getNote(userId, id);
      await noteService.deleteNote(userId, id);
      return { result: { deleted: id }, action: `Deleted journal entry “${note.title || 'Untitled'}”` };
    },
  },

  // ---------------- Calendar ----------------
  list_events: {
    declaration: {
      description: 'List calendar events, optionally between two times.',
      parameters: obj({ from: str(`Start of range, ${ISO}`), to: str(`End of range, ${ISO}`) }),
    },
    run: async (userId, { from, to }) => {
      const range = validate(defined({ from, to }), { from: { type: 'date' }, to: { type: 'date' } });
      const events = await calendarService.getEvents(userId, range);
      return { result: { events: events.map(eventView) } };
    },
  },
  create_event: {
    declaration: {
      description: 'Add an event to the user\'s calendar.',
      parameters: obj({
        title: S,
        startTime: str(ISO),
        endTime: str(`${ISO}. Default to one hour after start if the user gave no end.`),
        location: S,
        description: S,
      }, ['title', 'startTime']),
    },
    run: async (userId, args) => {
      const event = await calendarService.createEvent(userId, validate(defined(args), eventSpec));
      return { result: { event: eventView(event) }, action: `Added event “${event.title}”` };
    },
  },
  update_event: {
    declaration: {
      description: 'Change a calendar event (move it, rename it, change location or notes).',
      parameters: obj({ id: S, title: S, startTime: str(ISO), endTime: str(ISO), location: S, description: S }, ['id']),
    },
    run: async (userId, { id, ...args }) => {
      const event = await calendarService.updateEvent(userId, requireId({ id }), validate(defined(args), eventSpec, { partial: true }));
      return { result: { event: eventView(event) }, action: `Updated event “${event.title}”` };
    },
  },
  delete_event: {
    declaration: { description: 'Delete a calendar event permanently.', parameters: obj({ id: S }, ['id']) },
    run: async (userId, args) => {
      const id = requireId(args);
      const event = await calendarService.getEvent(userId, id);
      await calendarService.deleteEvent(userId, id);
      return { result: { deleted: id }, action: `Deleted event “${event.title}”` };
    },
  },

  // ---------------- Mood / wellbeing ----------------
  log_mood: {
    declaration: {
      description: 'Record a mood check-in. Scores are 1–10. Give at least one of mood, energy, stress, sleepHours.',
      parameters: obj({
        mood: num('1 (very low) to 10 (great)'),
        energy: num('1–10'),
        stress: num('1 (calm) to 10 (very stressed)'),
        sleepHours: num('Hours slept last night'),
        note: str('Short note in the user\'s words'),
      }),
    },
    run: async (userId, args) => {
      const data = validate(defined(args), entrySpec);
      if (!['mood', 'energy', 'stress', 'sleepHours'].some((k) => data[k] !== undefined)) {
        throw validationFailed({ body: 'Give at least one of mood, energy, stress, sleepHours' });
      }
      const entry = await wellnessService.createEntry(userId, data);
      const parts = ['mood', 'energy', 'stress'].filter((k) => entry[k] != null).map((k) => `${k} ${entry[k]}/10`);
      if (entry.sleepHours != null) parts.push(`sleep ${entry.sleepHours}h`);
      return { result: { entry: moodView(entry) }, action: `Logged a check-in (${parts.join(', ')})` };
    },
  },
  list_mood_entries: {
    declaration: {
      description: 'List recent mood check-ins (newest first).',
      parameters: obj({ days: int('How many days back (default 14)') }),
    },
    run: async (userId, { days = 14 }) => {
      const from = new Date(Date.now() - Math.min(Math.max(Number(days) || 14, 1), 365) * 86400000);
      const entries = await wellnessService.getEntries(userId, { from });
      return { result: { entries: entries.slice(0, 60).map(moodView) } };
    },
  },
  delete_mood_entry: {
    declaration: { description: 'Delete a mood check-in.', parameters: obj({ id: S }, ['id']) },
    run: async (userId, args) => {
      const id = requireId(args);
      await wellnessService.deleteEntry(userId, id);
      return { result: { deleted: id }, action: 'Deleted a mood check-in' };
    },
  },

  // ---------------- Mind map ----------------
  get_mind_map: {
    declaration: { description: 'Read the user\'s mind map: nodes (id, title, notes) and connections.', parameters: obj({}) },
    run: async (userId) => {
      const map = await mindmapService.getMap(userId);
      return { result: { nodes: map.nodes.map(({ id, title, content, type }) => ({ id, title, notes: content || undefined, type })), connections: map.connections } };
    },
  },
  add_mind_map_node: {
    declaration: {
      description: 'Add an idea to the mind map, optionally connected to an existing node. To connect a new idea to another new one, add the first, then use the id it returns as connectTo.',
      parameters: obj({ title: S, notes: str('Optional notes'), connectTo: int('Id of the node to connect it to') }, ['title']),
    },
    run: async (userId, { title, notes, connectTo }) => {
      if (typeof title !== 'string' || !title.trim()) throw validationFailed({ title: 'Required' });
      const node = await mindmapService.addNode(userId, {
        title: title.trim().slice(0, 200),
        content: (notes || '').slice(0, 5000),
        connectTo: connectTo === undefined ? undefined : requireNodeId(connectTo, 'connectTo'),
      });
      return { result: { node }, action: `Added “${node.title}” to the mind map` };
    },
  },
  update_mind_map_node: {
    declaration: {
      description: 'Rename a mind map node or change its notes.',
      parameters: obj({ id: I, title: S, notes: S }, ['id']),
    },
    run: async (userId, { id, title, notes }) => {
      const node = await mindmapService.updateNode(userId, requireNodeId(id), defined({
        title: title === undefined ? undefined : String(title).slice(0, 200),
        content: notes === undefined ? undefined : String(notes).slice(0, 5000),
      }));
      return { result: { node }, action: `Updated “${node.title}” on the mind map` };
    },
  },
  delete_mind_map_node: {
    declaration: { description: 'Remove a node (and its connections) from the mind map.', parameters: obj({ id: I }, ['id']) },
    run: async (userId, { id }) => {
      const node = await mindmapService.deleteNode(userId, requireNodeId(id));
      return { result: { deleted: node.id }, action: `Removed “${node.title}” from the mind map` };
    },
  },
  connect_mind_map_nodes: {
    declaration: { description: 'Connect two mind map nodes.', parameters: obj({ from: I, to: I }, ['from', 'to']) },
    run: async (userId, { from, to }) => {
      const a = requireNodeId(from, 'from');
      const b = requireNodeId(to, 'to');
      if (a === b) throw validationFailed({ to: 'Must be a different node' });
      await mindmapService.connectNodes(userId, a, b);
      return { result: { connected: [a, b] }, action: 'Connected two mind map ideas' };
    },
  },
};

const functionDeclarations = Object.entries(tools).map(([name, t]) => ({ name, ...t.declaration }));

// Runs one call. Errors become { error } results so the model can explain or retry.
const runTool = async (userId, name, args = {}) => {
  const tool = tools[name];
  if (!tool) return { result: { error: `Unknown tool ${name}` } };
  try {
    return await tool.run(userId, args || {});
  } catch (err) {
    if (err.expose) {
      const fields = err.fields ? ` (${Object.entries(err.fields).map(([k, v]) => `${k}: ${v}`).join('; ')})` : '';
      return { result: { error: `${err.message}${fields}` } };
    }
    console.error(`Agent tool ${name} failed:`, err);
    return { result: { error: 'That action failed on the server.' } };
  }
};

module.exports = { functionDeclarations, runTool, htmlToText, textToHtml };
