import PropTypes from 'prop-types';
import { CheckSquare, Filter, Search } from 'lucide-react';
import { STATUS_OPTIONS } from '../data/taskOptions';

// Search box, filter/bulk-action toggles, and the status/category filter panel.
const TaskToolbar = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  showBulkActions,
  onToggleBulkActions,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  categories,
  onClearFilters,
  shownCount,
  totalCount,
}) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="relative flex-1 max-w-xs">
        <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search wellness activities..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-3 py-1 w-full border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={onToggleFilters}
        className={`p-1 rounded-md border transition-colors ${
          showFilters ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-300 hover:bg-gray-100'
        }`}
        title="Toggle filters"
      >
        <Filter className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleBulkActions}
        className={`p-1 rounded-md border transition-colors ${
          showBulkActions ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-300 hover:bg-gray-100'
        }`}
        title="Bulk actions"
      >
        <CheckSquare className="w-4 h-4" />
      </button>
    </div>

    {showFilters && (
      <div className="bg-white p-2 rounded-md border border-gray-200 mb-2 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Wellness Category</label>
            <select
              value={filterCategory}
              onChange={(e) => onFilterCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Showing {shownCount} of {totalCount} wellness activities
        </div>
      </div>
    )}
  </div>
);

TaskToolbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  showFilters: PropTypes.bool.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  showBulkActions: PropTypes.bool.isRequired,
  onToggleBulkActions: PropTypes.func.isRequired,
  filterStatus: PropTypes.string.isRequired,
  onFilterStatusChange: PropTypes.func.isRequired,
  filterCategory: PropTypes.string.isRequired,
  onFilterCategoryChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClearFilters: PropTypes.func.isRequired,
  shownCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
};

export default TaskToolbar;
