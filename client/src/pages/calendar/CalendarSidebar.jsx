import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Edit3, Eye, Plus, Clock, Users, Video, FileText, MapPin, Bell, ChevronUp, ChevronDown } from 'lucide-react';

const CalendarSidebar = ({ currentDate, setCurrentDate, searchQuery, setSearchQuery, allEvents, isRightSidebar = false, isEditMode, setIsEditMode, selectedEvent, onSaveEvent, onEditClick, user }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
  const [eventData, setEventData] = useState({
    title: '',
    startTime: '3:30 PM',
    endTime: '4:00 PM',
    date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    isAllDay: false,
    timeZone: 'Time zone',
    repeat: 'Repeat',
    participants: '',
    conferencing: '',
    aiNotes: '',
    location: '',
    description: '',
    visibility: 'Default visibility',
    status: 'Busy',
    reminders: '30 min before'
  });

  useEffect(() => {
    if (selectedEvent) {
      console.log('Populating eventData with selectedEvent:', selectedEvent);
      setEventData({
        title: selectedEvent.title || '',
        startTime: selectedEvent.time?.split(' - ')[0] || '3:30 PM',
        endTime: selectedEvent.time?.split(' - ')[1] || '4:00 PM',
        date: selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isAllDay: false,
        timeZone: 'Time zone',
        repeat: 'Repeat',
        participants: '',
        conferencing: '',
        aiNotes: '',
        location: '',
        description: selectedEvent.description || '',
        visibility: 'Default visibility',
        status: 'Busy',
        reminders: '30 min before'
      });
    } else {
      console.log('Resetting eventData for new event');
      setEventData({
        title: '',
        startTime: '3:30 PM',
        endTime: '4:00 PM',
        date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isAllDay: false,
        timeZone: 'Time zone',
        repeat: 'Repeat',
        participants: '',
        conferencing: '',
        aiNotes: '',
        location: '',
        description: '',
        visibility: 'Default visibility',
        status: 'Busy',
        reminders: '30 min before'
      });
    }
  }, [selectedEvent, currentDate]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }
    
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleBackClick = () => {
    console.log('Back button clicked, setting isEditMode to false');
    if (setIsEditMode) {
      setIsEditMode(false);
    } else {
      console.error('setIsEditMode is not defined');
    }
  };

  const handleInputChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!eventData.title.trim()) {
      console.warn('Event title is required');
      alert('Event title is required');
      return;
    }
    try {
      const formattedEvent = {
        title: eventData.title,
        time: eventData.startTime + (eventData.endTime ? ` - ${eventData.endTime}` : ''),
        date: new Date(eventData.date).toISOString().split('T')[0] || currentDate.toISOString().split('T')[0],
        description: eventData.description,
        type: selectedEvent?.type || 'meeting',
        color: selectedEvent?.color || 'blue'
      };
      console.log('Saving event:', formattedEvent);
      if (onSaveEvent) {
        onSaveEvent(formattedEvent);
      } else {
        console.error('onSaveEvent is not defined');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Invalid date format. Please use a valid date (e.g., Sun Aug 24).');
    }
  };

  const days = getDaysInMonth(currentDate);
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const shortcuts = [
    { label: 'Command menu', keys: ['Ctrl', 'K'] },
    { label: 'Toggle sidebar', keys: ['⌘'] },
    { label: 'Go to date', keys: ['.'] },
    { label: 'All shortcuts', keys: ['?'] }
  ];

  const filteredEvents = allEvents ? allEvents.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query)) ||
      (event.time && event.time.toLowerCase().includes(query))
    );
  }) : [];

  const LeftCalendarSidebar = () => (
    <div className="w-56 bg-white h-screen flex flex-col border-r border-gray-200 overflow-hidden">
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
            {currentMonth} {currentYear}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-0.5 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-2.5 h-2.5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {daysOfWeek.map((day) => (
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
              onClick={() => {
                console.log('Edit3 button clicked in LeftCalendarSidebar');
                if (onEditClick) {
                  onEditClick();
                } else {
                  console.error('onEditClick is not defined');
                }
              }}
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

  const EventEditSidebar = () => (
    <div className="w-56 bg-white h-screen flex flex-col border-l border-gray-200 overflow-hidden">
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBackClick}
              className="p-0.5 hover:bg-gray-100 rounded"
              data-testid="back-button"
            >
              <Plus className="w-2.5 h-2.5 text-gray-600 rotate-45" />
            </button>
            <span className="text-[11px] font-medium text-gray-900 truncate">{selectedEvent ? 'Edit Event' : 'New Event'}</span>
          </div>
          <button
            onClick={handleSave}
            className="px-1.5 py-0.5 bg-blue-600 text-white rounded-md text-[11px] hover:bg-blue-700"
            data-testid="save-button"
          >
            Save
          </button>
        </div>
        <input
          type="text"
          placeholder="Title"
          value={eventData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full p-1.5 bg-gray-50 rounded-lg text-[11px] placeholder-gray-400 border-none focus:outline-none focus:bg-gray-100"
          data-testid="title-input"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="w-2.5 h-2.5 text-gray-400" />
            <div className="flex items-center gap-0.5">
              <input
                type="text"
                value={eventData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="text-[11px] text-gray-900 bg-transparent border-none focus:outline-none font-medium w-16"
                data-testid="start-time-input"
              />
              <span className="text-gray-400">→</span>
              <input
                type="text"
                value={eventData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="text-[11px] text-gray-900 bg-transparent border-none focus:outline-none font-medium w-16"
                data-testid="end-time-input"
              />
              <span className="text-[9px] text-gray-400 bg-gray-100 px-0.5 py-0.25 rounded">30 min</span>
            </div>
          </div>
          <div className="ml-4 mb-1.5">
            <input
              type="text"
              value={eventData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="text-[11px] text-gray-700 bg-transparent border-none focus:outline-none w-full"
              data-testid="date-input"
            />
          </div>
          <div className="ml-4 flex gap-3 text-[9px]">
            <button className="text-gray-400 hover:text-gray-600">All-day</button>
            <button className="text-gray-400 hover:text-gray-600">Time zone</button>
            <button className="text-gray-400 hover:text-gray-600">Repeat</button>
          </div>
        </div>

        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-2.5 h-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Participants"
              value={eventData.participants}
              onChange={(e) => handleInputChange('participants', e.target.value)}
              className="flex-1 text-[11px] text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <Video className="w-2.5 h-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Conferencing"
              value={eventData.conferencing}
              onChange={(e) => handleInputChange('conferencing', e.target.value)}
              className="flex-1 text-[11px] text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <FileText className="w-2.5 h-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="AI Meeting Notes and Docs"
              value={eventData.aiNotes}
              onChange={(e) => handleInputChange('aiNotes', e.target.value)}
              className="flex-1 text-[11px] text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-2.5 h-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={eventData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="flex-1 text-[11px] text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="p-2 border-b border-gray-100">
          <textarea
            placeholder="Description"
            value={eventData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full text-[11px] text-gray-400 bg-transparent border-none focus:outline-none resize-none placeholder-gray-400"
            rows="2"
          />
        </div>

        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-[9px] text-white font-medium">A</span>
            </div>
            <span className="text-[11px] text-gray-900 truncate">{user?.email || 'No email'}</span>
          </div>
          <div className="mt-1.5 ml-5.5 flex gap-3">
            <button className="text-[9px] text-gray-900 hover:text-gray-700 font-medium">Busy</button>
            <button className="text-[9px] text-gray-400 hover:text-gray-600">Default visibility</button>
          </div>
        </div>

        <div className="p-2">
          <div className="flex items-center gap-1.5">
            <Bell className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-[11px] text-gray-400 truncate">Reminders</span>
          </div>
          <div className="ml-4 mt-1">
            <span className="text-[11px] text-gray-900">30 min before</span>
          </div>
        </div>
      </div>
    </div>
  );

  const DefaultRightSidebar = () => (
    <div className="w-56 bg-white border-l border-gray-200 p-3 flex flex-col gap-5 h-screen overflow-hidden">
      <div className="relative">
        <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search events"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
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
          {shortcuts.map((shortcut, index) => (
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

  console.log('Rendering CalendarSidebar, isRightSidebar:', isRightSidebar, 'isEditMode:', isEditMode, 'user:', user);
  if (isRightSidebar) {
    return isEditMode ? <EventEditSidebar /> : <DefaultRightSidebar />;
  }

  return <LeftCalendarSidebar />;
};

export default CalendarSidebar;