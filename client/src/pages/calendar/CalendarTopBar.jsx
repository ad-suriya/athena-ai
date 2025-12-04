import React, { useState } from 'react';
import { Home, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// Reusable UserAvatar component
const UserAvatar = ({ user, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    if (!name || name.trim() === '') return 'A'; // Fallback to 'A' for "Avatar"
    return name
      .split(' ')
      .filter((n) => n) // Remove empty strings
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters
  };

  const initials = user?.displayName || user?.email
    ? getInitials(user.displayName || user.email)
    : 'A';

  return user?.photoURL && !imageError ? (
    <img
      src={user.photoURL}
      alt={`${user?.displayName || 'User'}'s profile picture`}
      className={`w-10 h-10 rounded-full object-cover ${className}`}
      onError={() => setImageError(true)} // Fallback to initials if image fails
    />
  ) : (
    <div
      className={`w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-base font-medium ${className}`}
    >
      {initials}
    </div>
  );
};

const CalendarTopBar = ({ viewMode, setViewMode, currentDate, setCurrentDate, user }) => {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const safeUser = user || { displayName: '', email: '', photoURL: '' };
  console.log('User object:', safeUser); // Debug user data

  // Format month for display
  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Navigate by month
  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Navigate by week
  const navigateWeek = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  };

  // Navigate by day
  const navigateDay = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
  };

  const viewOptions = ['Day', 'Week', 'Month'];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Go back home"
            aria-label="Go back home"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {formatMonth(currentDate)}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <UserAvatar user={safeUser} className="hover:bg-orange-600 transition-colors" />
          <div className="relative">
            <button
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              aria-label={`View mode: ${viewMode}`}
            >
              <span className="font-medium text-gray-700">{viewMode}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {showViewDropdown && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {viewOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setViewMode(option.toLowerCase());
                      setShowViewDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      viewMode === option.toLowerCase() ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
            aria-label="Go to today"
          >
            Today
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth(-1);
                else if (viewMode === 'week') navigateWeek(-1);
                else navigateDay(-1);
              }}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={`Previous ${viewMode}`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth(1);
                else if (viewMode === 'week') navigateWeek(1);
                else navigateDay(1);
              }}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={`Next ${viewMode}`}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTopBar;