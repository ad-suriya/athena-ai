'use strict';

// Test harness: an in-memory stand-in for Firestore and Firebase Auth, and a scripted
// Gemini, installed in place of src/config/firebase and src/config/vertex before any
// app module loads. Each test file runs in its own process (node --test), so every
// file gets a fresh copy.
//
// Covers the Firestore surface the services use: collection/doc/where('==')/get, set
// (with merge), update, create (fails with code 6 if present), delete, batch, and the
// serverTimestamp/delete sentinels. Dates are stored as Timestamp-like objects.

const path = require('path');

class FakeTimestamp {
  constructor(date) { this.date = new Date(date); }
  toDate() { return new Date(this.date); }
  toMillis() { return this.date.getTime(); }
}

const SERVER_TIMESTAMP = Symbol('serverTimestamp');
const DELETE = Symbol('delete');

const store = new Map(); // 'collection/id' → data
const failures = [];     // [{ op, match(path, data) }] — next matching write throws
let autoId = 0;

const resolve = (data) => {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === DELETE) continue;
    if (v === SERVER_TIMESTAMP) out[k] = new FakeTimestamp(Date.now());
    else if (v instanceof Date) out[k] = new FakeTimestamp(v);
    else out[k] = v;
  }
  return out;
};

const maybeFail = (op, key, data) => {
  const i = failures.findIndex((f) => f.op === op && f.match(key, data));
  if (i === -1) return;
  failures.splice(i, 1);
  throw new Error(`Injected ${op} failure`);
};

const snapshot = (ref) => {
  const data = store.get(ref.path);
  return {
    id: ref.id,
    ref,
    exists: data !== undefined,
    data: () => (data === undefined ? undefined : { ...data }),
    get: (field) => data?.[field],
  };
};

const docRef = (collection, id) => {
  const ref = {
    id,
    path: `${collection}/${id}`,
    get: async () => snapshot(ref),
    set: async (data, { merge } = {}) => {
      maybeFail('set', ref.path, data);
      const base = merge ? store.get(ref.path) || {} : {};
      const next = { ...base, ...resolve(data) };
      for (const [k, v] of Object.entries(data)) if (v === DELETE) delete next[k];
      store.set(ref.path, next);
    },
    create: async (data) => {
      maybeFail('create', ref.path, data);
      if (store.has(ref.path)) throw Object.assign(new Error('6 ALREADY_EXISTS: Document already exists'), { code: 6 });
      store.set(ref.path, resolve(data));
    },
    update: async (data) => {
      if (!store.has(ref.path)) throw Object.assign(new Error('5 NOT_FOUND'), { code: 5 });
      maybeFail('update', ref.path, data);
      const next = { ...store.get(ref.path), ...resolve(data) };
      for (const [k, v] of Object.entries(data)) if (v === DELETE) delete next[k];
      store.set(ref.path, next);
    },
    delete: async () => { store.delete(ref.path); },
  };
  return ref;
};

const db = {
  collection: (name) => ({
    doc: (id) => docRef(name, id ?? `auto${(autoId += 1)}`),
    where: (field, op, value) => ({
      get: async () => {
        if (op !== '==') throw new Error(`Unsupported operator ${op}`);
        const docs = [...store.entries()]
          .filter(([key, data]) => key.startsWith(`${name}/`) && !key.slice(name.length + 1).includes('/') && data[field] === value)
          .map(([key]) => snapshot(docRef(name, key.slice(name.length + 1))));
        return { docs };
      },
    }),
  }),
  batch: () => {
    const ops = [];
    return {
      update: (ref, data) => ops.push(() => ref.update(data)),
      commit: async () => { for (const op of ops) await op(); },
    };
  },
};

// Bearer tokens accepted by requireAuth: 'token-<uid>'.
const admin = {
  apps: [{}],
  auth: () => ({
    verifyIdToken: async (token) => {
      const m = /^token-([A-Za-z0-9_-]+)$/.exec(token);
      if (!m) throw new Error('bad token');
      return { uid: m[1] };
    },
  }),
  firestore: { FieldValue: { serverTimestamp: () => SERVER_TIMESTAMP, delete: () => DELETE } },
};

// Scripted Gemini: each generate() call takes the next reply. A reply is a function
// (request → response) or a plain string (returned as JSON/text with no tool calls).
const geminiScript = [];
const geminiRequests = [];
const textResponse = (text) => ({ text, sources: [], response: { functionCalls: [], candidates: [{ content: { role: 'model', parts: [{ text }] } }] } });
const callResponse = (calls) => ({
  text: '',
  sources: [],
  response: { functionCalls: calls, candidates: [{ content: { role: 'model', parts: calls.map((c) => ({ functionCall: c })) } }] },
});
const vertex = {
  isAvailable: () => true,
  isRateLimit: () => false,
  generate: async (request) => {
    geminiRequests.push(request);
    const next = geminiScript.shift();
    if (next === undefined) throw new Error('Gemini script exhausted');
    if (typeof next === 'function') return next(request);
    return textResponse(typeof next === 'string' ? next : JSON.stringify(next));
  },
  generateText: async () => '',
};

const stub = (rel, exports) => {
  const id = require.resolve(path.join(__dirname, '..', '..', 'src', rel));
  require.cache[id] = { id, filename: id, loaded: true, exports };
};
stub('config/firebase', { admin, db, firebaseApp: {} });
stub('config/vertex', vertex);

const reset = () => {
  store.clear();
  failures.length = 0;
  geminiScript.length = 0;
  geminiRequests.length = 0;
};

// Starts the Express app on a free port. → { request(method, path, { token, body }), close }
const startApp = async () => {
  const app = require('../../src/app');
  const server = await new Promise((ok) => { const s = app.listen(0, () => ok(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (method, url, { token, body } = {}) => {
    const res = await fetch(`${base}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  };
  return { request, close: () => new Promise((ok) => server.close(ok)) };
};

module.exports = {
  store,
  failures,
  geminiScript,
  geminiRequests,
  textResponse,
  callResponse,
  FakeTimestamp,
  reset,
  startApp,
};
