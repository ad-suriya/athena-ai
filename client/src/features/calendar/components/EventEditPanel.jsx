import PropTypes from 'prop-types';
import { Bell, Clock, FileText, MapPin, Plus, Users, Video } from 'lucide-react';

// Right column while creating/editing an event. Controlled by useEventForm.
const EventEditPanel = ({ eventData, onFieldChange, isNew, onSave, onBack, user }) => (
  <div className="w-56 bg-white h-screen flex flex-col border-l border-gray-200 overflow-hidden">
    <div className="p-2 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onBack}
            className="p-0.5 hover:bg-gray-100 rounded"
            data-testid="back-button"
          >
            <Plus className="w-2.5 h-2.5 text-gray-600 rotate-45" />
          </button>
          <span className="text-[11px] font-medium text-gray-900 truncate">{isNew ? 'New Event' : 'Edit Event'}</span>
        </div>
        <button
          onClick={onSave}
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
        onChange={(e) => onFieldChange('title', e.target.value)}
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
              onChange={(e) => onFieldChange('startTime', e.target.value)}
              className="text-[11px] text-gray-900 bg-transparent border-none focus:outline-none font-medium w-16"
              data-testid="start-time-input"
            />
            <span className="text-gray-400">→</span>
            <input
              type="text"
              value={eventData.endTime}
              onChange={(e) => onFieldChange('endTime', e.target.value)}
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
            onChange={(e) => onFieldChange('date', e.target.value)}
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
            onChange={(e) => onFieldChange('participants', e.target.value)}
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
            onChange={(e) => onFieldChange('conferencing', e.target.value)}
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
            onChange={(e) => onFieldChange('aiNotes', e.target.value)}
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
            onChange={(e) => onFieldChange('location', e.target.value)}
            className="flex-1 text-[11px] text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-400"
          />
        </div>
      </div>

      <div className="p-2 border-b border-gray-100">
        <textarea
          placeholder="Description"
          value={eventData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
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

EventEditPanel.propTypes = {
  eventData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    participants: PropTypes.string.isRequired,
    conferencing: PropTypes.string.isRequired,
    aiNotes: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  isNew: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  user: PropTypes.shape({ email: PropTypes.string }),
};

export default EventEditPanel;
