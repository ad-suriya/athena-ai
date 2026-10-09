import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Flame, CalendarCheck, MessageCircle, CheckSquare, BookOpen, Smile } from 'lucide-react';
import { useMonthActivity } from './hooks/useMonthActivity';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BREAKDOWN = [
  { key: 'messages', label: 'Messages to Athena' },
  { key: 'tasksCompleted', label: 'Tasks completed' },
  { key: 'tasksAdded', label: 'Tasks added' },
  { key: 'journal', label: 'Journal entries' },
  { key: 'moodCheckIns', label: 'Mood check-ins' },
  { key: 'events', label: 'Events added' },
];

const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sameDay = (a, b) => dayKey(a) === dayKey(b);

// Heat level by number of actions that day.
const cellClass = (total) => {
  if (!total) return 'bg-[#F6F1F0] text-ink-muted';
  if (total <= 2) return 'bg-brand-100 text-brand-700';
  if (total <= 5) return 'bg-brand-300 text-white';
  return 'bg-brand-500 text-white';
};

const Stat = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-card border border-line bg-white p-4 shadow-card">
    <div className="flex items-center justify-between text-sm text-ink-muted">
      {label}
      <Icon className="h-4 w-4 text-brand-500" />
    </div>
    <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{value}</p>
    {hint && <p className="text-xs text-ink-faint">{hint}</p>}
  </div>
);

Stat.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  hint: PropTypes.string,
};

// Insights: what the user actually did each day this month, from their own data.
const Insights = () => {
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(null); // Date
  const { data, error, isLoading } = useMonthActivity(month.getFullYear(), month.getMonth());

  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const shift = (delta) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
    setSelected(null);
  };

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array(month.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth;
  const shown = selected || (isCurrentMonth ? today : null);
  const shownCounts = shown && data?.days[dayKey(shown)];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Insights</h1>
            <p className="text-sm text-ink-muted">What you did each day, from your chats, tasks, journal, mood check-ins and calendar.</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-white px-2 py-1.5">
            <button onClick={() => shift(-1)} className="rounded-lg p-1 text-ink-muted hover:bg-brand-50" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[8.5rem] text-center text-sm font-medium text-ink" aria-live="polite">
              {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => shift(1)} disabled={isCurrentMonth} className="rounded-lg p-1 text-ink-muted hover:bg-brand-50 disabled:opacity-30" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700" role="alert">Couldn’t load your insights: {error}</div>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Stat icon={CalendarCheck} label="Active days" value={data ? data.activeDays : '–'} hint={data ? `of ${elapsedDays} days so far` : undefined} />
          <Stat icon={Flame} label="Longest streak" value={data ? `${data.longestStreak} ${data.longestStreak === 1 ? 'day' : 'days'}` : '–'} />
          <Stat icon={MessageCircle} label="Messages to Athena" value={data ? data.totals.messages : '–'} />
          <Stat icon={CheckSquare} label="Tasks completed" value={data ? data.totals.tasksCompleted : '–'} />
          <Stat icon={BookOpen} label="Journal entries" value={data ? data.totals.journal : '–'} />
          <Stat icon={Smile} label="Mood check-ins" value={data ? data.totals.moodCheckIns : '–'} />
        </div>

        <div className="flex flex-col gap-6 rounded-card border border-line bg-white p-4 shadow-card sm:p-6 lg:flex-row">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <div className="mb-2 grid grid-cols-7 gap-1.5">
              {DAY_NAMES.map((d) => <div key={d} className="text-center text-xs font-medium text-ink-faint">{d}</div>)}
            </div>
            <div className={`grid grid-cols-7 gap-1.5 ${isLoading ? 'animate-pulse' : ''}`} role="grid" aria-label="Activity by day">
              {cells.map((date, i) => {
                if (!date) return <div key={`blank-${i}`} />;
                const total = data?.days[dayKey(date)]?.total || 0;
                const future = date > today && !sameDay(date, today);
                return (
                  <button
                    key={dayKey(date)}
                    type="button"
                    disabled={future}
                    onClick={() => setSelected(date)}
                    aria-label={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: ${total} ${total === 1 ? 'action' : 'actions'}`}
                    aria-pressed={shown ? sameDay(date, shown) : false}
                    className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium tabular-nums transition ${
                      future ? 'bg-white text-ink-faint/60 ring-1 ring-line' : cellClass(total)
                    } ${shown && sameDay(date, shown) ? 'ring-2 ring-ink ring-offset-1' : ''}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              Less
              {[0, 1, 3, 6].map((n) => <span key={n} className={`h-4 w-4 rounded ${cellClass(n)}`} />)}
              More
            </div>
          </div>

          <div className="lg:w-64">
            {shown ? (
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  {shown.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                {shownCounts ? (
                  <dl className="mt-3 space-y-1.5 text-sm">
                    {BREAKDOWN.filter((b) => shownCounts[b.key] > 0).map((b) => (
                      <div key={b.key} className="flex justify-between">
                        <dt className="text-ink-muted">{b.label}</dt>
                        <dd className="font-semibold tabular-nums text-ink">{shownCounts[b.key]}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-ink-muted">{isLoading ? 'Loading…' : 'Nothing recorded this day.'}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Pick a day to see what you did.</p>
            )}
            {data && data.activeDays === 0 && (
              <p className="mt-4 rounded-xl bg-[#FFFAF9] p-3 text-xs text-ink-muted">
                No activity this month yet. Chatting with Athena, finishing tasks, writing in your journal and checking in on your mood all show up here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
