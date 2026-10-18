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
    <div className="bg-white border border-brand-200 rounded-xl p-4 mb-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-medium">Add New Wellness Activity</h3>
        <button
          onClick={onClose}
          className="text-ink-faint hover:text-ink"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">
            Activity <span className="text-brand-500">*</span>
          </label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setField('title', e.target.value)}
            className="w-full border border-line rounded-xl px-2 py-1 text-sm focus:ring-1 focus:ring-brand-200 focus:border-transparent"
            placeholder="What wellness activity would you like to add?"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) onSubmit();
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Status</label>
          <select
            value={draft.status}
            onChange={(e) => setField('status', e.target.value)}
            className="w-full border border-line rounded-xl px-2 py-1 text-sm focus:ring-1 focus:ring-brand-200 focus:border-transparent"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Icon</label>
          <select
            value={draft.icon}
            onChange={(e) => setField('icon', e.target.value)}
            className="w-full border border-line rounded-xl px-2 py-1 text-sm focus:ring-1 focus:ring-brand-200 focus:border-transparent"
          >
            {ICON_NAMES.map(icon => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Wellness Category</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {WELLNESS_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  draft.category.includes(cat)
                    ? 'bg-brand-50 text-brand-600 border-brand-200'
                    : 'bg-[#F5F2F1] text-ink-muted border-line hover:bg-[#EEEAE9]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Notes</label>
          <textarea
            value={draft.notes}
            onChange={(e) => setField('notes', e.target.value)}
            className="w-full border border-line rounded-xl px-2 py-1 text-sm focus:ring-1 focus:ring-brand-200 focus:border-transparent"
            rows="2"
            placeholder="How does this activity support your mental wellness?"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="bg-brand-500 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Wellness Activity
        </button>
        <button
          onClick={onClear}
          className="bg-[#EEEAE9] text-ink px-3 py-1.5 rounded-xl text-sm hover:bg-[#E6E1E0] transition-colors"
        >
          Clear
        </button>
        <div className="flex-1"></div>
        <div className="text-xs text-ink-muted flex items-center">
          <kbd className="px-1 py-0.5 bg-[#F5F2F1] rounded">Ctrl</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1 py-0.5 bg-[#F5F2F1] rounded">Enter</kbd>
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
