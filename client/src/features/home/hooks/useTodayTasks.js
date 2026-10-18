import { useMemo } from 'react';
import * as taskService from '../../../services/taskService';
import { selectTodaysTasks } from '../utils/homeUtils';
import { useAsyncData } from './useAsyncData';

// Today's tasks with completion counts, and an optimistic completion toggle.
export const useTodayTasks = () => {
  const { data: tasks, setData: setTasks, isLoading, error } = useAsyncData(taskService.getTasks, []);
  const today = useMemo(() => selectTodaysTasks(tasks), [tasks]);
  const completed = today.filter((t) => t.status === 'completed').length;

  const toggle = async (task) => {
    const status = task.status === 'completed' ? 'todo' : 'completed';
    const apply = (next) => setTasks((prev) => prev.map((t) => (t.id === task.id ? next : t)));
    apply({ ...task, status, completedAt: status === 'completed' ? new Date().toISOString() : null });
    try {
      apply(await taskService.updateTask(task.id, { status }));
    } catch {
      apply(task); // roll back
    }
  };

  return { tasks: today, completed, total: today.length, isLoading, error, toggle };
};
