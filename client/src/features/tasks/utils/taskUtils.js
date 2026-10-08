// Pure helpers for the Wellness Tracker. No React.
import { Heart } from 'lucide-react';
import { TASK_ICONS } from '../data/taskOptions';

export const getTaskIcon = (name) => TASK_ICONS[name] || Heart;

export const getStatusColor = (status) => {
  switch (status) {
    case "To Do": return "text-red-600 bg-red-100";
    case "In progress": return "text-blue-600 bg-blue-100";
    case "Done": return "text-green-600 bg-green-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

// Categories used by any task plus the built-in ones, sorted.
export const collectCategories = (tasks, baseCategories) => {
  const categories = new Set();
  tasks.forEach(task => {
    task.category.forEach(cat => categories.add(cat));
  });
  baseCategories.forEach(cat => categories.add(cat));
  return Array.from(categories).sort();
};

// searchTerm matches title, notes, or any category (case-insensitive).
export const filterTasks = (tasks, { searchTerm, status, category }) => {
  const term = searchTerm.toLowerCase();
  return tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(term) ||
                         task.notes.toLowerCase().includes(term) ||
                         task.category.some(cat => cat.toLowerCase().includes(term));
    const matchesStatus = !status || task.status === status;
    const matchesCategory = !category || task.category.includes(category);

    return matchesSearch && matchesStatus && matchesCategory;
  });
};

// sortConfig: { key: field name or null, direction: 'asc' | 'desc' }. Returns a new array.
export const sortTasks = (tasks, { key, direction }) => {
  if (!key) return tasks;
  return [...tasks].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// { [status]: tasks[] } in the order of `statuses`.
export const groupTasksByStatus = (tasks, statuses) => {
  const groups = {};
  statuses.forEach(status => {
    groups[status] = tasks.filter(task => task.status === status);
  });
  return groups;
};
