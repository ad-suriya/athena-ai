import { useMemo, useRef, useState } from 'react';
import { ArrowDown, Heart, X } from 'lucide-react';
import Sidebar from '../../components/sidebar/Sidebar';
import { useTasks } from './hooks/useTasks';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useScrollContainer } from './hooks/useScrollContainer';
import { EMPTY_TASK, VIEW_MODES } from './data/taskOptions';
import TaskToolbar from './components/TaskToolbar';
import TaskBulkActions from './components/TaskBulkActions';
import TaskViewControls from './components/TaskViewControls';
import TaskForm from './components/TaskForm';
import TaskTable from './components/TaskTable';
import TaskGroups from './components/TaskGroups';
import TaskSuggestions from './components/TaskSuggestions';

// Wellness Tracker page: coordinates task data (useTasks), filtering (useTaskFilters),
// selection, editing and the new-task draft. Rendering lives in ./components.
export default function WellnessTracker() {
  const { tasks, isLoading, error, clearError, createTask, updateTasks, deleteTasks } = useTasks();
  const filters = useTaskFilters(tasks);
  const { filteredTasks, groupedTasks, allCategories } = filters;

  const [viewMode, setViewMode] = useState(VIEW_MODES.ALL);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState(EMPTY_TASK);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const mainContentRef = useRef(null);
  const { isScrolledDown, scrollToTop, scrollToBottom } = useScrollContainer(mainContentRef);

  const categoryOptions = useMemo(() => allCategories.map(cat => ({
    value: cat,
    label: cat,
    color: 'bg-purple-100 text-purple-700'
  })), [allCategories]);

  const resetNewTaskForm = () => setNewTask(EMPTY_TASK);

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    const created = await createTask({
      ...newTask,
      category: newTask.category.filter(cat => cat.trim() !== '')
    });
    if (!created) return;

    resetNewTaskForm();
    setShowNewTaskForm(false);

    setTimeout(() => scrollToTop(), 100);
  };

  const updateTask = (id, updatedTask) => {
    updateTasks([id], updatedTask);
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this wellness activity?')) {
      deleteTasks([id]);
      setSelectedTasks(prev => prev.filter(taskId => taskId !== id));
    }
  };

  const duplicateTask = async (task) => {
    const created = await createTask({
      ...task,
      title: `${task.title} (Copy)`,
      status: 'To Do'
    });
    if (!created) return;

    setTimeout(() => scrollToTop(), 100);
  };

  const addSuggestion = async (suggestion) => {
    const created = await createTask({
      ...suggestion,
      status: 'To Do'
    });
    if (created) setTimeout(() => scrollToTop(), 300);
    return created;
  };

  const toggleTaskSelection = (id) => {
    setSelectedTasks(prev =>
      prev.includes(id)
        ? prev.filter(taskId => taskId !== id)
        : [...prev, id]
    );
  };

  const selectAllTasks = () => {
    const allTaskIds = filteredTasks.map(task => task.id);
    setSelectedTasks(
      selectedTasks.length === allTaskIds.length ? [] : allTaskIds
    );
  };

  const bulkUpdateStatus = (status) => {
    updateTasks(selectedTasks, { status });
    setSelectedTasks([]);
  };

  const bulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} wellness activities?`)) {
      deleteTasks(selectedTasks);
      setSelectedTasks([]);
    }
  };

  const rowActions = {
    onUpdate: updateTask,
    onEdit: setEditingTask,
    onCancelEdit: () => setEditingTask(null),
    onDuplicate: duplicateTask,
    onDelete: deleteTask,
  };

  return (
    <div className="flex bg-[#FCF4F1] h-screen w-full overflow-hidden">
      {/* Sidebar - Fixed position */}
      <div className={`${isSidebarVisible ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
        <Sidebar
          isSidebarVisible={isSidebarVisible}
          setIsSidebarVisible={setIsSidebarVisible}
        />
      </div>

      {/* Main Content - Dynamic width */}
      <div
        ref={mainContentRef}
        className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out ml-0"
        style={{
          width: isSidebarVisible ? 'calc(100% - 256px)' : '100%'
        }}
      >
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-semibold">Wellness Tracker</h1>
            </div>
            <p className="text-xs text-gray-600 max-w-xl">
              A gentle, intuitive system for tracking mental wellness activities. Nourish your mind, one activity at a time.
            </p>
          </div>

          <TaskToolbar
            searchTerm={filters.searchTerm}
            onSearchChange={filters.setSearchTerm}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showBulkActions={showBulkActions}
            onToggleBulkActions={() => setShowBulkActions(!showBulkActions)}
            filterStatus={filters.filterStatus}
            onFilterStatusChange={filters.setFilterStatus}
            filterCategory={filters.filterCategory}
            onFilterCategoryChange={filters.setFilterCategory}
            categories={allCategories}
            onClearFilters={filters.clearFilters}
            shownCount={filteredTasks.length}
            totalCount={tasks.length}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 mb-2 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="p-0.5 hover:bg-red-100 rounded" title="Dismiss">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {selectedTasks.length > 0 && (
            <TaskBulkActions
              selectedCount={selectedTasks.length}
              onSetStatus={bulkUpdateStatus}
              onDelete={bulkDelete}
              onCancel={() => setSelectedTasks([])}
            />
          )}

          <TaskViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            taskCount={filteredTasks.length}
            onToggleNewTask={() => setShowNewTaskForm(!showNewTaskForm)}
            onShowSuggestions={scrollToBottom}
          />

          {showNewTaskForm && (
            <TaskForm
              draft={newTask}
              onDraftChange={setNewTask}
              onSubmit={addTask}
              onClear={resetNewTaskForm}
              onClose={() => setShowNewTaskForm(false)}
            />
          )}

          {viewMode === VIEW_MODES.ALL ? (
            <TaskTable
              tasks={filteredTasks}
              sortConfig={filters.sortConfig}
              onSort={filters.handleSort}
              showCheckbox={showBulkActions}
              selectedIds={selectedTasks}
              onToggleSelect={toggleTaskSelection}
              onSelectAll={selectAllTasks}
              isLoading={isLoading}
              hasActiveFilters={filters.hasActiveFilters}
              showNewTaskForm={showNewTaskForm}
              onOpenNewTask={() => setShowNewTaskForm(true)}
              editingId={editingTask}
              categoryOptions={categoryOptions}
              actions={rowActions}
            />
          ) : (
            <TaskGroups
              groupedTasks={groupedTasks}
              totalCount={tasks.length}
              editingId={editingTask}
              categoryOptions={categoryOptions}
              actions={rowActions}
            />
          )}

          <TaskSuggestions onAdd={addSuggestion} />
        </div>

        {isScrolledDown && (
          <button
            onClick={scrollToBottom}
            className="fixed right-8 bottom-8 z-40 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 hover:scale-110"
            title="Scroll to Athena AI Suggestions"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
