import PropTypes from 'prop-types';
import { Brain, Calendar, CalendarIcon, Home, Plus, TrendingUp } from 'lucide-react';

// `id` is the route segment navigated to (routes match case-insensitively).
const NAV_ITEMS = [
  { id: "Home", icon: Home, label: "Home" },
  { id: "Tasks", icon: CalendarIcon, label: "Tasks" },
  { id: "mindmap", icon: Brain, label: "Mind Map" },
  { id: "Settings", icon: TrendingUp, label: "Heat Map" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
];

// Main navigation links and the "Quick Actions" section.
const SidebarNavigation = ({ activeNav, onNavClick, onNewJournalEntry }) => (
  <div className="flex-1 overflow-y-auto min-h-0 py-3">
    <div className="px-3">
      <div className="space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavClick(item.id)}
            className={`
              w-full flex items-center gap-2.5 px-3 py-1 rounded-xl transition-all duration-200
              ${activeNav === item.id
                ? 'bg-[#FF6F61]/10 text-[#FF6F61]'
                : 'text-[#2B3440] hover:bg-[#FFE7E5]'
              }
            `}
          >
            <item.icon className={`w-5 h-5 ${activeNav === item.id ? 'text-[#FF6F61]' : 'text-gray-500'}`} />
            <span className="text-sm font-medium">{item.label}</span>
            {activeNav === item.id && (
              <div className="ml-auto w-1 h-6 bg-[#FF6F61] rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 px-1.5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
        <div className="space-y-0.5">
          <button
            onClick={onNewJournalEntry}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-[#2B3440] hover:bg-[#FFE7E5] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Journal Entry
          </button>
        </div>
      </div>
    </div>
  </div>
);

SidebarNavigation.propTypes = {
  activeNav: PropTypes.string.isRequired,
  onNavClick: PropTypes.func.isRequired,
  onNewJournalEntry: PropTypes.func.isRequired,
};

export default SidebarNavigation;
