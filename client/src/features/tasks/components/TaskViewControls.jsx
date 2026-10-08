import PropTypes from 'prop-types';
import { Brain, Menu, Plus, Target } from 'lucide-react';
import { VIEW_MODES } from '../data/taskOptions';

// View switch (all / grouped by status) plus "New" and "AI Suggestions" buttons.
const TaskViewControls = ({ viewMode, onViewModeChange, taskCount, onToggleNewTask, onShowSuggestions }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <button
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
          viewMode === VIEW_MODES.ALL ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => onViewModeChange(VIEW_MODES.ALL)}
      >
        <Menu className="w-3 h-3" />
        All Activities ({taskCount})
      </button>
      <button
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
          viewMode === VIEW_MODES.GROUPED ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => onViewModeChange(VIEW_MODES.GROUPED)}
      >
        <Target className="w-3 h-3" />
        Grouped by status
      </button>
    </div>

    <div className="flex items-center gap-1">
      <button
        onClick={onToggleNewTask}
        className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-purple-700 transition-colors"
      >
        <Plus className="w-3 h-3" />
        New Wellness Activity
      </button>
      <button
        onClick={onShowSuggestions}
        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
        title="Go to Athena AI Suggestions"
      >
        <Brain className="w-3 h-3" />
        AI Suggestions
      </button>
    </div>
  </div>
);

TaskViewControls.propTypes = {
  viewMode: PropTypes.oneOf(Object.values(VIEW_MODES)).isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  taskCount: PropTypes.number.isRequired,
  onToggleNewTask: PropTypes.func.isRequired,
  onShowSuggestions: PropTypes.func.isRequired,
};

export default TaskViewControls;
