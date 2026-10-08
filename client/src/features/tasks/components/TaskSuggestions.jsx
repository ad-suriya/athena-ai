import { useState } from 'react';
import PropTypes from 'prop-types';
import { Brain } from 'lucide-react';
import { SUGGESTIONS } from '../data/taskOptions';
import { getTaskIcon } from '../utils/taskUtils';

// "Athena AI Suggestions": fixed suggestion cards that can be added as tasks.
// onAdd(suggestion) resolves truthy when the task was created.
const TaskSuggestions = ({ onAdd }) => {
  const [addedIds, setAddedIds] = useState([]);

  const addSuggestion = async (suggestion) => {
    if (await onAdd(suggestion)) {
      setAddedIds(prev => [...prev, suggestion.id]);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-md border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Athena AI Suggestions</h2>
      </div>
      <p className="text-xs text-gray-600 mb-4">
        Based on your wellness journey, here are some gentle suggestions to support your mental health today.
        Click &quot;Add Activity&quot; to add any suggestion to your wellness tracker above.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {SUGGESTIONS.map((suggestion) => {
          const Icon = getTaskIcon(suggestion.icon);
          const isAdded = addedIds.includes(suggestion.id);

          return (
            <div key={suggestion.id} className={`bg-gray-50 border ${isAdded ? 'border-green-200' : 'border-gray-200'} rounded-lg p-3 hover:bg-gray-100 transition-colors`}>
              <div className="flex items-start justify-between mb-2">
                <Icon className="w-4 h-4 text-purple-600 mt-0.5" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                    {suggestion.category[0]}
                  </span>
                  {isAdded && (
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Added
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</h3>
              <p className="text-xs text-gray-600 mb-3">{suggestion.notes}</p>
              <button
                onClick={() => addSuggestion(suggestion)}
                disabled={isAdded}
                className={`w-full px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isAdded
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : 'bg-white border border-purple-600 text-purple-600 hover:bg-purple-50'
                }`}
              >
                {isAdded ? '✓ Added to Tracker' : 'Add Activity'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

TaskSuggestions.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default TaskSuggestions;
