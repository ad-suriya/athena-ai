import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Info, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [heatmapData, setHeatmapData] = useState({});
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate mock data safely
  useEffect(() => {
    const generateMockData = () => {
      setLoading(true);
      const currentMonth = selectedMonth.getMonth();
      const currentYear = selectedMonth.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const data = {};
      const today = new Date();
      const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cellDate = new Date(currentYear, currentMonth, day);
        
        // Check if date is in the future
        const isFutureDate = cellDate > currentDate;
        const isToday = cellDate.getDate() === currentDate.getDate() && 
                       cellDate.getMonth() === currentDate.getMonth() && 
                       cellDate.getFullYear() === currentDate.getFullYear();
        
        if (isFutureDate) {
          // Future dates show as empty
          data[dateKey] = {
            logins: 0,
            date: cellDate,
            isFuture: true
          };
                } else if (isToday) {
          // Today - show as logged in
          data[dateKey] = {
            logins: 1, // Always 1 for today
            date: cellDate,
            isFuture: false
          };
                } else {
          // All past dates show as no login (since project started today)
          data[dateKey] = {
            logins: 0, // No logins for past dates
            date: cellDate,
            isFuture: false
          };
        }
      }
      
      setHeatmapData(data);
      setLoading(false);
    };

    generateMockData();
  }, [selectedMonth]);

  const handleGoBack = () => {
    navigate('/');
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    const currentDate = new Date();
    
    // Don't allow selecting future months
    if (nextMonth.getMonth() > currentDate.getMonth() && nextMonth.getFullYear() >= currentDate.getFullYear()) {
      return;
    }
    setSelectedMonth(nextMonth);
  };

  const getCellColor = (hasLogin, isFuture) => {
    if (isFuture) {
      return '#EEEEEE'; // Light gray for future dates
    }
    if (hasLogin) {
      return '#E25752'; // Your specified color for login
    }
    return '#EEEEEE'; // Base color for no login
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = heatmapData[dateKey];
      days.push({
        day,
        data: dayData,
        date: new Date(year, month, day)
      });
    }
    
    return days;
  };

  const calculateStats = () => {
    const dataValues = Object.values(heatmapData);
    const pastDates = dataValues.filter(day => !day?.isFuture);
    
    const totalLogins = pastDates.reduce((sum, day) => sum + (day?.logins || 0), 0);
    const loginDays = pastDates.filter(day => day?.logins > 0).length;
    const consistencyScore = pastDates.length > 0 ? Math.round((loginDays / pastDates.length) * 100) : 0;
    
    return { totalLogins, consistencyScore, loginDays };
  };

  const days = getDaysInMonth();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const stats = calculateStats();
  const currentDate = new Date();

  if (loading) {
    return (
      <div className="h-screen p-4 flex items-center justify-center bg-[#FCF4F1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading your engagement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FCF4F1] overflow-y-auto">
      <div className="p-4 md:p-6">
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Return to Chat</span>
        </button>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-1">Engagement Dashboard</h1>
              <p className="text-gray-600 text-sm">Track your daily platform usage</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700 text-sm">{getMonthName(selectedMonth)}</span>
                <div className="flex gap-1 ml-2">
                  <button 
                    onClick={handlePreviousMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Previous month"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors rotate-180 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next month"
                    disabled={selectedMonth.getMonth() >= currentDate.getMonth() && selectedMonth.getFullYear() >= currentDate.getFullYear()}
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview - Simplified */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-gray-600 text-sm font-medium">Daily Logins</h3>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.loginDays}</p>
              <p className="text-xs text-gray-500 mt-0.5">Days with login</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-gray-600 text-sm font-medium">Total Logins</h3>
                <Calendar className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLogins}</p>
              <p className="text-xs text-gray-500 mt-0.5">This month</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-gray-600 text-sm font-medium">Consistency</h3>
                <Info className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.consistencyScore}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Login days ratio</p>
            </div>
          </div>

          {/* Heatmap Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Heatmap */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1.5">
                  {days.map((dayData, index) => {
                    const hasLogin = dayData?.data?.logins > 0 || false;
                    const isFuture = dayData?.data?.isFuture || false;
                    const isToday = dayData?.date && 
                      dayData.date.getDate() === currentDate.getDate() &&
                      dayData.date.getMonth() === currentDate.getMonth() &&
                      dayData.date.getFullYear() === currentDate.getFullYear();
                    
                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded-md transition-all duration-150 relative ${
                          dayData ? 'hover:scale-[1.02] hover:shadow-sm cursor-pointer' : 'opacity-0'
                        } ${isToday ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                        style={{
                          backgroundColor: dayData ? getCellColor(hasLogin, isFuture) : 'transparent',
                          border: dayData ? '1px solid rgba(0,0,0,0.05)' : 'none'
                        }}
                        onMouseEnter={() => dayData && setHoveredDay(dayData)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {dayData && (
                          <div className="h-full flex flex-col items-center justify-center p-1">
                            <span className={`text-xs font-medium ${
                              hasLogin ? 'text-white' : 'text-gray-600'
                            }`}>
                              {dayData.day}
                            </span>
                            {isFuture && (
                              <span className="text-[10px] text-gray-400 mt-0.5">●</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend below heatmap */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: '#E25752' }} />
                        <span className="text-xs text-gray-600">Logged in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: '#FCF4F1', border: '1px solid #E5E7EB' }} />
                        <span className="text-xs text-gray-600">No login</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: '#EEEEEE', border: '1px solid #D1D5DB' }} />
                      <span className="text-xs text-gray-500">Future date</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Side Panel */}
              <div className="lg:w-56 space-y-4">
                {hoveredDay && hoveredDay.data ? (
                  <div className="bg-white/50 rounded-lg border p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">
                      {hoveredDay.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {hoveredDay.data.isFuture && <span className="ml-2 text-xs text-gray-500">(Upcoming)</span>}
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Login Status:</span>
                        <span className={`text-sm font-semibold ${hoveredDay.data.logins > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {hoveredDay.data.logins > 0 ? 'Logged in' : 'No login'}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-800 font-medium text-sm">Daily Count:</span>
                          <span className="font-bold text-gray-900">{hoveredDay.data.logins}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/50 rounded-lg border p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      How to read
                    </h3>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-sm mt-0.5" style={{ backgroundColor: '#E25752' }} />
                        <span>Red = Logged in today</span>
                      </li>
                      
                      <li className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-sm mt-0.5" style={{ backgroundColor: '#EEEEEE', border: '1px solid #D1D5DB' }} />
                        <span>Gray = No login</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Blue ring = Today</span>
                      </li>
                    </ul>
                  </div>
                )}
                
                {/* Quick Stats */}
                <div className="bg-white/50 rounded-lg border p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">This Month</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Login days:</span>
                      <span className="font-semibold text-gray-800 text-sm">{stats.loginDays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Consistency:</span>
                      <span className="font-semibold text-gray-800 text-sm">{stats.consistencyScore}%</span>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <p className="text-xs text-gray-500">
                        {stats.consistencyScore > 50 
                          ? 'Great consistency! Keep up the daily engagement.'
                          : 'Focus on building a daily habit for better results.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;