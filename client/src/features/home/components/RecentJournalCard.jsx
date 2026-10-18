import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import HomeCard from './HomeCard';
import { formatLongDate, stripHtml } from '../utils/homeUtils';

// The most recently edited journal entry, with a link to open it.
const RecentJournalCard = ({ entry, isLoading, error }) => (
  <HomeCard icon={BookOpen} title="Recent Journal" action={{ label: 'View all', to: '/notes' }}>
    {error ? (
      <p className="text-sm text-brand-600">Couldn&apos;t load your journal. {error}</p>
    ) : isLoading ? (
      <p className="text-sm text-ink-faint">Loading…</p>
    ) : !entry ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
        <p className="text-sm text-ink-muted">No journal entries yet.</p>
        <Link to="/notes?new=1" className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100">Write your first entry</Link>
      </div>
    ) : (
      <Link to={`/notes?id=${encodeURIComponent(entry.id)}`} className="group block rounded-2xl border border-line p-4 hover:border-brand-200 hover:bg-brand-50/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-ink-muted">{formatLongDate(entry.updatedAt || entry.createdAt)}</p>
            <p className="mt-1 truncate text-[15px] font-semibold text-ink">{entry.title || 'Untitled entry'}</p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted group-hover:text-brand-500" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{stripHtml(entry.content) || 'This entry is empty.'}</p>
      </Link>
    )}
  </HomeCard>
);

RecentJournalCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default RecentJournalCard;
