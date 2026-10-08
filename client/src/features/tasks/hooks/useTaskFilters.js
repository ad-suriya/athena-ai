import { useMemo, useState } from 'react';
import { STATUS_OPTIONS, WELLNESS_CATEGORIES } from '../data/taskOptions';
import { collectCategories, filterTasks, groupTasksByStatus, sortTasks } from '../utils/taskUtils';

// Search, status/category filters and column sorting for the task list.
export const useTaskFilters = (tasks) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const allCategories = useMemo(() => collectCategories(tasks, WELLNESS_CATEGORIES), [tasks]);

  const filteredTasks = useMemo(
    () => sortTasks(filterTasks(tasks, { searchTerm, status: filterStatus, category: filterCategory }), sortConfig),
    [tasks, searchTerm, filterStatus, filterCategory, sortConfig]
  );

  const groupedTasks = useMemo(() => groupTasksByStatus(filteredTasks, STATUS_OPTIONS), [filteredTasks]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterCategory('');
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    hasActiveFilters: Boolean(searchTerm || filterStatus || filterCategory),
    clearFilters,
    sortConfig,
    handleSort,
    allCategories,
    filteredTasks,
    groupedTasks,
  };
};
