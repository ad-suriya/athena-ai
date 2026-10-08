import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { ICON_NAMES, STATUS_OPTIONS, WELLNESS_CATEGORIES } from '../data/taskOptions';

// "Add New Wellness Activity" form. The draft is owned by the parent so it
// survives closing and reopening the form. Ctrl+Enter in the title submits.
const TaskForm = ({ draft, onDraftChange, onSubmit, onClear, onClose }) => {
  const canSubmit = Boolean(draft.title.trim());
  const setField = (field, value) => onDraftChange(prev => ({...prev, [field]: value}));

  const toggleCategory = (cat) => {
    const categories = draft.category.includes(cat)
      ? draft.category.filter(c => c !== cat)
      : [...draft.category, cat];
    setField('category', categories);
  };

  return (
    <div className="bg-white border border-blue-200 rounded-md p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-medium">Add New Wellness Activity</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Activity <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setField('title', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="What wellness activity would you like to add?"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) onSubmit();
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={draft.status}
            onChange={(e) => setField('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
          <select
            value={draft.icon}
            onChange={(e) => setField('icon', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            {ICON_NAMES.map(icon => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Wellness Category</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {WELLNESS_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`text-[10px] px-2 py-1 rounded-full border ${
                  draft.category.includes(cat)
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={draft.notes}
            onChange={(e) => setField('notes', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            placeholder="How does this activity support your mental wellness?"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="bg-purple-600 text-white px-2 py-1 rounded-md text-xs hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Wellness Activity
        </button>
        <button
          onClick={onClear}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
        <div className="flex-1"></div>
        <div className="text-[10px] text-gray-500 flex items-center">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd>
          <span className="ml-1">to save</span>
        </div>
      </div>
    </div>
  );
};

TaskForm.propTypes = {
  draft: PropTypes.shape({
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    category: PropTypes.arrayOf(PropTypes.string).isRequired,
    notes: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  onDraftChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TaskForm;
