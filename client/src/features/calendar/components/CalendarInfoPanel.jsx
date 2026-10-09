import PropTypes from 'prop-types';
import { Search, Users } from 'lucide-react';

const SHORTCUTS = [
  { label: 'Command menu', keys: ['Ctrl', 'K'] },
  { label: 'Toggle sidebar', keys: ['⌘'] },
  { label: 'Go to date', keys: ['.'] },
  { label: 'All shortcuts', keys: ['?'] }
];

// Right column when not editing: event search, quick meeting, shortcut hints.
const CalendarInfoPanel = ({ searchQuery, setSearchQuery }) => (
  <div className="w-56 bg-white border-l border-gray-200 p-3 flex flex-col gap-5 h-screen overflow-hidden">
    <div className="relative">
      <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 text-gray-400" />
      <input
        type="text"
        placeholder="Search events"
        value={searchQuery || ''}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-7 pr-2 py-1 border border-gray-200 rounded-lg text-[11px] bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300"
        data-testid="search-input"
      />
    </div>

    <div className="flex flex-col gap-2">
      <h3 className="text-gray-800 text-[12px] font-semibold truncate">No upcoming meeting</h3>
    </div>

    <div className="flex flex-col gap-1.5">
      <h3 className="text-gray-800 text-[12px] font-semibold truncate">Quick meeting</h3>
      <div className="flex items-center gap-1.5 p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors">
        <Users className="w-2.5 h-2.5 text-gray-400" />
        <span className="text-[11px] text-gray-400 flex-1 truncate">Meet with...</span>
        <span className="text-[9px] text-gray-400 bg-gray-100 px-0.5 py-0.25 rounded font-mono">F</span>
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <h3 className="text-gray-800 text-[12px] font-semibold truncate">Useful shortcuts</h3>
      <div className="flex flex-col gap-0.5">
        {SHORTCUTS.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-0.25">
            <span className="text-[11px] text-gray-600 truncate">{shortcut.label}</span>
            <div className="flex gap-0.5">
              {shortcut.keys.map((key, keyIndex) => (
                <span
                  key={keyIndex}
                  className="text-[9px] text-gray-500 bg-gray-100 px-0.5 py-0.25 rounded font-mono"
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

CalendarInfoPanel.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
};

export default CalendarInfoPanel;
