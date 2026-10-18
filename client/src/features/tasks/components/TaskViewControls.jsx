import PropTypes from 'prop-types';
import { Brain, Menu, Plus, Target } from 'lucide-react';
import { VIEW_MODES } from '../data/taskOptions';

// View switch (all / grouped by status) plus "New" and "AI Suggestions" buttons.
const TaskViewControls = ({ viewMode, onViewModeChange, taskCount, onToggleNewTask, onShowSuggestions }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
    <div className="flex items-center gap-2">
      <button
        className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
          viewMode === VIEW_MODES.ALL ? "bg-[#F5F2F1] text-ink" : "text-ink-muted hover:text-ink"
        }`}
        onClick={() => onViewModeChange(VIEW_MODES.ALL)}
      >
        <Menu className="w-3 h-3" />
        All Activities ({taskCount})
      </button>
      <button
        className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
          viewMode === VIEW_MODES.GROUPED ? "bg-[#F5F2F1] text-ink" : "text-ink-muted hover:text-ink"
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
        className="flex items-center gap-1 whitespace-nowrap bg-brand-500 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
      >
        <Plus className="w-3 h-3" />
        New Wellness Activity
      </button>
      <button
        onClick={onShowSuggestions}
        className="flex items-center gap-1 whitespace-nowrap bg-[#F5F2F1] text-ink px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-[#EEEAE9] transition-colors"
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
