'use strict';

const {
  requireDb,
  isAlreadyExists,
  serverTimestamp,
  serializeDoc,
  getOwnedDoc,
  listOwnedDocs,
  byTimestamp,
} = require('../utils/firestore');
const { validationFailed } = require('../utils/errors');

const COLLECTION = 'calendarEvents';
const TIMESTAMP_FIELDS = ['createdAt', 'updatedAt', 'startTime', 'endTime'];

const serialize = (snap) => serializeDoc(snap, TIMESTAMP_FIELDS);

const assertValidRange = (startTime, endTime) => {
  if (startTime && endTime && endTime < startTime) {
    throw validationFailed({ endTime: 'Must not be before startTime' });
  }
};

// from/to (Dates, optional) select events whose startTime falls in [from, to).
const getEvents = async (userId, { from, to } = {}) => {
  const docs = await listOwnedDocs(COLLECTION, userId);
  return docs
    .filter((d) => {
      const start = d.get('startTime')?.toDate?.();
      if (!start) return !from && !to;
      return (!from || start >= from) && (!to || start < to);
    })
    .sort(byTimestamp('startTime', 'asc'))
    .map(serialize);
};

const getEvent = async (userId, eventId) => {
  const { snap } = await getOwnedDoc(COLLECTION, eventId, userId);
  return serialize(snap);
};

const newEventDoc = (userId, data) => ({
  userId,
  title: data.title.trim(),
  description: data.description ?? '',
  startTime: data.startTime,
  endTime: data.endTime ?? null,
  location: data.location ?? '',
  color: data.color ?? '',
  category: data.category ?? '',
  allDay: data.allDay ?? false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const createEvent = async (userId, data) => {
  assertValidRange(data.startTime, data.endTime);
  const ref = requireDb().collection(COLLECTION).doc();
  await ref.set(newEventDoc(userId, data));
  return serialize(await ref.get());
};

// Like createTaskOnce: a retry with the same id returns the first event. → { event, created }
const createEventOnce = async (userId, eventId, data) => {
  assertValidRange(data.startTime, data.endTime);
  const ref = requireDb().collection(COLLECTION).doc(eventId);
  try {
    await ref.create(newEventDoc(userId, data));
    return { event: serialize(await ref.get()), created: true };
  } catch (err) {
    if (!isAlreadyExists(err)) throw err;
  }
  const { snap } = await getOwnedDoc(COLLECTION, eventId, userId);
  return { event: serialize(snap), created: false };
};

const updateEvent = async (userId, eventId, data) => {
  const { ref, snap } = await getOwnedDoc(COLLECTION, eventId, userId);
  const startTime = data.startTime ?? snap.get('startTime')?.toDate?.();
  const endTime = data.endTime !== undefined ? data.endTime : snap.get('endTime')?.toDate?.();
  assertValidRange(startTime, endTime);
  await ref.update({
    ...data,
    ...(data.title !== undefined ? { title: data.title.trim() } : {}),
    updatedAt: serverTimestamp(),
  });
  return serialize(await ref.get());
};

const deleteEvent = async (userId, eventId) => {
  const { ref } = await getOwnedDoc(COLLECTION, eventId, userId);
  await ref.delete();
};

module.exports = { getEvents, getEvent, createEvent, createEventOnce, updateEvent, deleteEvent };
