import PropTypes from 'prop-types';
import { BookOpen, Plus } from 'lucide-react';
import { stripHtml } from '../../../utils/text';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

// All journal entries, newest first, with a "New entry" button.
const JournalList = ({ entries, selectedId, isDraftSelected, isLoading, onSelect, onNew }) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
      <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-[-0.02em] text-ink">
        <BookOpen className="h-6 w-6 text-brand-500" strokeWidth={1.9} />
        Journal
      </h1>
      <button
        type="button"
        onClick={onNew}
        className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
      >
        <Plus className="h-4 w-4" /> New entry
      </button>
    </div>

    <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-4" aria-label="Journal entries">
      {isDraftSelected && (
        <li>
          <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
            <p className="text-sm font-semibold text-ink">New entry</p>
            <p className="text-xs text-ink-muted">Not saved yet</p>
          </div>
        </li>
      )}
      {isLoading && <li className="px-4 py-3 text-sm text-ink-faint">Loading entries…</li>}
      {!isLoading && entries.length === 0 && !isDraftSelected && (
        <li className="px-4 py-6 text-center text-sm text-ink-muted">No entries yet. Start with “New entry”.</li>
      )}
      {entries.map((entry) => {
        const selected = entry.id === selectedId;
        const preview = stripHtml(entry.content);
        return (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelect(entry.id)}
              aria-current={selected ? 'true' : undefined}
              className={`block w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                selected ? 'border-brand-200 bg-brand-50' : 'border-transparent hover:bg-brand-50/50'
              }`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-semibold text-ink">{entry.title || 'Untitled entry'}</span>
                <span className="shrink-0 text-xs text-ink-faint">{formatDate(entry.updatedAt || entry.createdAt)}</span>
              </span>
              <span className="mt-1 line-clamp-2 block text-sm text-ink-muted">{preview || 'Empty entry'}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);

JournalList.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  })).isRequired,
  selectedId: PropTypes.string,
  isDraftSelected: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
};

export default JournalList;
