import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const handleNewEventClick = () => {
    // Redirect to /calendar route
    navigate('/calendar');
  };

  const addNewEvent = () => {
    // This function remains for adding events locally (optional, can be removed if not needed)
    const newEvent = {
      id: Date.now(),
      title: `New Event ${events.length + 1}`,
      date: new Date().toLocaleDateString(),
      time: '10:00 AM'
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-medium text-gray-700">Upcoming events</h2>
      </div>

      {/* Content Area */}
      <div className="border-2 border-gray-300 rounded-3xl p-8">
        {events.length === 0 ? (
          // Empty State
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 border-2 border-gray-300 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-base mb-6">
              No upcoming events in the next 3 days
            </p>
            <button
              onClick={handleNewEventClick}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-full hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              New event
            </button>
          </div>
        ) : (
          // Events List
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t-2 border-gray-300">
              <button
                onClick={handleNewEventClick}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-full hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                New event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;