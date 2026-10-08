import { useState, useEffect, useCallback, useRef } from 'react';
import * as taskService from '../../../services/taskService';

// Task.jsx works with { id, icon, title, status: 'To Do' | 'In progress' | 'Done',
// category: string[], notes, completed }. The API uses the canonical schema.
const STATUS_TO_API = { 'To Do': 'todo', 'In progress': 'in_progress', Done: 'completed' };
const STATUS_FROM_API = { todo: 'To Do', in_progress: 'In progress', completed: 'Done' };

const toUiTask = (task) => {
  const status = STATUS_FROM_API[task.status] || 'To Do';
  return {
    id: task.id,
    icon: task.icon || 'Heart',
    title: task.title,
    status,
    category: task.tags || [],
    notes: task.description || '',
    completed: status === 'Done',
  };
};

// Accepts a full or partial UI task; ignores UI-only fields (id, completed).
const toApiFields = (uiTask) => {
  const fields = {};
  if (uiTask.title !== undefined) fields.title = uiTask.title;
  if (uiTask.status !== undefined) fields.status = STATUS_TO_API[uiTask.status] || 'todo';
  if (uiTask.category !== undefined) fields.tags = uiTask.category.map((c) => c.trim()).filter(Boolean);
  if (uiTask.notes !== undefined) fields.description = uiTask.notes;
  if (uiTask.icon !== undefined) fields.icon = uiTask.icon;
  return fields;
};

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    let cancelled = false;
    taskService
      .getTasks()
      .then((data) => {
        if (!cancelled) setTasks(data.map(toUiTask));
      })
      .catch((err) => {
        if (!cancelled) setError(`Could not load activities: ${err.message}`);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Returns the created task, or null on failure.
  const createTask = useCallback(async (uiTask) => {
    try {
      const created = toUiTask(await taskService.createTask(toApiFields(uiTask)));
      setTasks((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(`Could not add activity: ${err.message}`);
      return null;
    }
  }, []);

  // Optimistic: applies changes locally, rolls back the affected tasks if the API rejects.
  const updateTasks = useCallback(async (ids, changes) => {
    const previous = tasksRef.current.filter((t) => ids.includes(t.id));
    setTasks((prev) =>
      prev.map((t) => {
        if (!ids.includes(t.id)) return t;
        const next = { ...t, ...changes };
        return { ...next, completed: next.status === 'Done' };
      })
    );
    const results = await Promise.allSettled(ids.map((id) => taskService.updateTask(id, toApiFields(changes))));
    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      const failedIds = new Set(ids.filter((_, i) => results[i].status === 'rejected'));
      setTasks((prev) => prev.map((t) => (failedIds.has(t.id) ? previous.find((p) => p.id === t.id) || t : t)));
      setError(`Could not save changes: ${failed[0].reason.message}`);
    }
  }, []);

  const deleteTasks = useCallback(async (ids) => {
    const previous = tasksRef.current;
    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    const results = await Promise.allSettled(ids.map((id) => taskService.deleteTask(id)));
    const failedIds = new Set(ids.filter((_, i) => results[i].status === 'rejected'));
    if (failedIds.size > 0) {
      // Restore only the tasks that failed to delete, in their original positions,
      // keeping any tasks added or edited while the request was in flight.
      setTasks((prev) => {
        const current = new Map(prev.map((t) => [t.id, t]));
        const restored = previous
          .filter((t) => failedIds.has(t.id) || current.has(t.id))
          .map((t) => current.get(t.id) || t);
        const added = prev.filter((t) => !previous.some((p) => p.id === t.id));
        return [...restored, ...added];
      });
      setError(`Could not delete ${failedIds.size} activit${failedIds.size === 1 ? 'y' : 'ies'}.`);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { tasks, isLoading, error, clearError, createTask, updateTasks, deleteTasks };
};
