import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit3, Eye, FileText, Plus, Search } from 'lucide-react';
import { buildMonthGrid, MONTH_NAMES } from '../utils/calendarDates';

const MINI_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Left column: mini month navigator, "Scheduling" (opens a new event), calendar list.
const CalendarMiniMonth = ({ currentDate, setCurrentDate, onEditClick, user }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
  const days = buildMonthGrid(currentDate);

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="w-full md:w-56 bg-white md:h-screen flex flex-col border-b md:border-b-0 md:border-r border-gray-200 overflow-hidden">
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w- sense-item" data-testid="search-input" />
            <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
              <Search className="w-2.5 h-2.5 text-gray-600" />
            </div>
            <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
              <Edit3 className="w-2.5 h-2.5 text-gray-600" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ChevronUp className="w-2.5 h-2.5 text-gray-400" />
            <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-0.5 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-2.5 h-2.5 text-gray-600" />
          </button>
          <h2 className="font-medium text-gray-900 text-[11px] truncate">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-0.5 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-2.5 h-2.5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {MINI_DAYS.map((day) => (
            <div key={day} className="text-center text-[9px] font-medium text-gray-500 p-0.5">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((dayObj, index) => (
            <button
              key={index}
              onClick={() => dayObj.isCurrentMonth && setSelectedDate(dayObj.day)}
              className={`
                h-6 w-6 text-[10px] rounded flex items-center justify-center font-medium
                ${dayObj.isCurrentMonth 
                  ? dayObj.day === selectedDate 
                    ? 'bg-red-500 text-white' 
                    : dayObj.day === 1 || dayObj.day === 2
                    ? 'text-gray-900 hover:bg-gray-100 font-semibold'
                    : 'text-gray-900 hover:bg-gray-100'
                  : 'text-gray-300'
                }
              `}
            >
              {dayObj.day}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 py-1.5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onEditClick}
              className="p-0.5 hover:bg-gray-100 rounded"
              data-testid="edit-button"
            >
              <Edit3 className="w-2.5 h-2.5 text-gray-500" />
            </button>
            <span className="font-medium text-gray-900 text-[11px] truncate">Scheduling</span>
          </div>
          <Eye className="w-2.5 h-2.5 text-gray-500" />
        </div>
      </div>

      <div className="px-2 py-1.5 flex-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-[11px] text-gray-900 font-medium truncate">{user?.email || 'No email'}</div>
              <div className="text-[9px] text-gray-500 truncate">Default</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <div className="text-[11px] text-gray-900 truncate">Holidays in India</div>
          </div>
          
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 w-full py-0.5 text-[11px]">
            <Plus className="w-2.5 h-2.5" />
            <span className="truncate">Add calendar account</span>
          </button>
        </div>
      </div>

      <div className="p-2 border-t border-gray-100">
        <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 w-full py-0.5 text-[11px]">
          <div className="w-3.5 h-3.5 bg-gray-100 rounded flex items-center justify-center">
            <FileText className="w-2 h-2 text-gray-600" />
          </div>
          <span className="truncate">Add Notion database</span>
        </button>
      </div>
    </div>
  );
};

CalendarMiniMonth.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  setCurrentDate: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  user: PropTypes.shape({ email: PropTypes.string }),
};

export default CalendarMiniMonth;
