'use strict';

// Test harness: an in-memory stand-in for Firestore and Firebase Auth, and a scripted
// Gemini, installed in place of src/config/firebase and src/config/vertex before any
// app module loads. Each test file runs in its own process (node --test), so every
// file gets a fresh copy.
//
// Covers the Firestore surface the services use: collection/doc/where('==')/get, set
// (with merge), update, create (fails with code 6 if present), delete, batch, and the
// serverTimestamp/delete sentinels. Dates are stored as Timestamp-like objects.
// Vector search: FieldValue.vector and where(...).findNearest (cosine), with a fake
// embed() that maps text to word counts over a small fixed vocabulary.

const path = require('path');

class FakeTimestamp {
  constructor(date) { this.date = new Date(date); }
  toDate() { return new Date(this.date); }
  toMillis() { return this.date.getTime(); }
}

class FakeVector {
  constructor(values) { this.values = [...values]; }
  toArray() { return [...this.values]; }
}

const cosineDistance = (a, b) => {
  let dot = 0; let na = 0; let nb = 0;
  a.forEach((x, i) => { dot += x * b[i]; na += x * x; nb += b[i] * b[i]; });
  return na && nb ? 1 - dot / Math.sqrt(na * nb) : 1;
};

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
    collection: (sub) => collectionRef(`${ref.path}/${sub}`),
  };
  return ref;
};

// Direct children of a collection path (not documents in deeper subcollections).
const childrenOf = (name) => [...store.entries()]
  .filter(([key]) => key.startsWith(`${name}/`) && !key.slice(name.length + 1).includes('/'));
const toSnap = (name) => ([key]) => snapshot(docRef(name, key.slice(name.length + 1)));

function collectionRef(name) {
  return {
    doc: (id) => docRef(name, id ?? `auto${(autoId += 1)}`),
    get: async () => {
      const docs = childrenOf(name).map(toSnap(name));
      return { docs, size: docs.length };
    },
    orderBy: (field, direction = 'asc') => ({
      get: async () => {
        const at = (data) => data[field]?.toMillis?.() ?? data[field] ?? 0;
        const docs = childrenOf(name)
          .sort(([, a], [, b]) => (direction === 'asc' ? at(a) - at(b) : at(b) - at(a)))
          .map(toSnap(name));
        return { docs };
      },
    }),
    where: (field, op, value) => {
      if (op !== '==') throw new Error(`Unsupported operator ${op}`);
      const matching = () => childrenOf(name).filter(([, data]) => data[field] === value);
      return {
        get: async () => ({ docs: matching().map(([key]) => snapshot(docRef(name, key.slice(name.length + 1)))) }),
        findNearest: ({ vectorField, queryVector, limit, distanceMeasure, distanceResultField }) => ({
          get: async () => {
            if (distanceMeasure !== 'COSINE') throw new Error(`Unsupported distance ${distanceMeasure}`);
            if (failures.some((f) => f.op === 'findNearest')) throw new Error('Injected findNearest failure');
            const docs = matching()
              .filter(([, data]) => data[vectorField] instanceof FakeVector)
              .map(([key, data]) => ({ key, distance: cosineDistance(data[vectorField].toArray(), queryVector) }))
              .sort((a, b) => a.distance - b.distance)
              .slice(0, limit)
              .map(({ key, distance }) => {
                const snap = snapshot(docRef(name, key.slice(name.length + 1)));
                const data = { ...snap.data(), [distanceResultField]: distance };
                return { ...snap, data: () => ({ ...data }), get: (f) => data[f] };
              });
            return { docs };
          },
        }),
      };
    },
  };
}

const db = {
  collection: (name) => collectionRef(name),
  batch: () => {
    const ops = [];
    return {
      set: (ref, data, options) => ops.push(() => ref.set(data, options)),
      update: (ref, data) => ops.push(() => ref.update(data)),
      delete: (ref) => ops.push(() => ref.delete()),
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
  firestore: { FieldValue: { serverTimestamp: () => SERVER_TIMESTAMP, delete: () => DELETE, vector: (values) => new FakeVector(values) } },
};

// Scripted Gemini: each generate() call takes the next reply. A reply is a function
// (request → response) or a plain string (returned as JSON/text with no tool calls).
const geminiScript = [];
const geminiRequests = [];
const embedRequests = [];
// Each group is one dimension: words in a group count as the same meaning.
const EMBED_VOCABULARY = [
  ['tired', 'exhausted', 'burnt', 'drained'],
  ['work', 'office', 'job', 'boss'],
  ['happy', 'joy', 'glad', 'great'],
  ['sister', 'brother', 'family', 'mom'],
  ['run', 'running', 'gym', 'exercise'],
];
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
  embed: async (texts, taskType) => {
    embedRequests.push({ texts, taskType });
    if (failures.some((f) => f.op === 'embed')) throw new Error('Injected embed failure');
    return texts.map((text) => {
      const words = text.toLowerCase().match(/[a-z]+/g) || [];
      return EMBED_VOCABULARY.map((group) => words.filter((w) => group.includes(w)).length);
    });
  },
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
  embedRequests.length = 0;
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
  embedRequests,
  textResponse,
  callResponse,
  FakeTimestamp,
  reset,
  startApp,
};
