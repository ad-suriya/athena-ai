import PropTypes from 'prop-types';
import { AlignLeft, CalendarDays, Clock, MapPin, Trash2, X } from 'lucide-react';

const inputClass = 'w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100';

const Field = ({ icon: Icon, label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-2 text-xs font-medium text-ink-muted">
      <Icon className="h-3.5 w-3.5" /> {label}
    </label>
    {children}
  </div>
);

Field.propTypes = { icon: PropTypes.elementType.isRequired, label: PropTypes.string.isRequired, htmlFor: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

// Create/edit form for an event. Controlled by useEventForm; every field is saved.
const EventEditPanel = ({ eventData, onFieldChange, isNew, onSave, onBack, onDelete }) => (
  <div className="flex w-full flex-col bg-white md:h-full md:w-80">
    <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
      <h2 className="text-base font-semibold text-ink">{isNew ? 'New event' : 'Edit event'}</h2>
      <button onClick={onBack} className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50" aria-label="Close" data-testid="back-button">
        <X className="h-4 w-4" />
      </button>
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
      <input
        type="text"
        placeholder="Add a title"
        value={eventData.title}
        onChange={(e) => onFieldChange('title', e.target.value)}
        className="w-full border-0 border-b border-line bg-transparent px-0 pb-2 text-lg font-semibold text-ink placeholder:text-ink-faint focus:border-brand-400 focus:outline-none focus:ring-0"
        data-testid="title-input"
        aria-label="Title"
      />
      <Field icon={CalendarDays} label="Date" htmlFor="event-date">
        <input id="event-date" type="text" value={eventData.date} onChange={(e) => onFieldChange('date', e.target.value)} className={inputClass} data-testid="date-input" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field icon={Clock} label="Starts" htmlFor="event-start">
          <input id="event-start" type="text" value={eventData.startTime} onChange={(e) => onFieldChange('startTime', e.target.value)} className={inputClass} data-testid="start-time-input" />
        </Field>
        <Field icon={Clock} label="Ends" htmlFor="event-end">
          <input id="event-end" type="text" value={eventData.endTime} onChange={(e) => onFieldChange('endTime', e.target.value)} className={inputClass} data-testid="end-time-input" />
        </Field>
      </div>
      <Field icon={MapPin} label="Location" htmlFor="event-location">
        <input id="event-location" type="text" value={eventData.location} onChange={(e) => onFieldChange('location', e.target.value)} placeholder="Optional" className={inputClass} />
      </Field>
      <Field icon={AlignLeft} label="Description" htmlFor="event-description">
        <textarea id="event-description" rows="4" value={eventData.description} onChange={(e) => onFieldChange('description', e.target.value)} placeholder="Optional" className={`${inputClass} resize-none`} />
      </Field>
    </div>

    <div className="flex items-center gap-2 border-t border-line px-5 py-4">
      {!isNew && (
        <button onClick={onDelete} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      )}
      <button onClick={onBack} className="ml-auto rounded-xl px-4 py-2 text-sm text-ink-muted hover:bg-brand-50">Cancel</button>
      <button onClick={onSave} className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600" data-testid="save-button">
        Save
      </button>
    </div>
  </div>
);

EventEditPanel.propTypes = {
  eventData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  isNew: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default EventEditPanel;
