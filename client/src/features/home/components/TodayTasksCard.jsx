import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Check, SquareCheckBig } from 'lucide-react';
import HomeCard from './HomeCard';
import ProgressRing from './ProgressRing';
import { taskTime } from '../utils/homeUtils';

const VISIBLE = 5;

// Ring of today's progress and the first few of today's tasks, checkable in place.
const TodayTasksCard = ({ tasks, completed, total, isLoading, error, onToggle }) => (
  <HomeCard icon={SquareCheckBig} title="Today's Tasks" action={{ label: 'View all', to: '/tasks' }}>
    {error ? (
      <p className="text-sm text-brand-600">Couldn&apos;t load tasks. {error}</p>
    ) : isLoading ? (
      <p className="text-sm text-ink-faint">Loading tasks…</p>
    ) : total === 0 ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
        <p className="text-sm text-ink-muted">Nothing on your list for today.</p>
        <Link to="/tasks" className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100">Add a task</Link>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <ProgressRing value={completed / total} size={118} stroke={10}>
          <span className="text-[28px] font-bold leading-none text-ink">{completed}/{total}</span>
          <span className="mt-1 text-sm text-ink-muted">completed</span>
        </ProgressRing>
        <ul className="min-w-0 flex-1 space-y-2.5 self-stretch">
          {tasks.slice(0, VISIBLE).map((task) => {
            const done = task.status === 'completed';
            return (
              <li key={task.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggle(task)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${done ? 'border-brand-500 bg-brand-500 text-white' : 'border-[#D9D4D3] bg-white hover:border-brand-300'}`}
                  aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                  aria-pressed={done}
                >
                  {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
                <span className={`min-w-0 flex-1 truncate text-sm ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>{task.title}</span>
                <span className="shrink-0 text-sm tabular-nums text-ink-muted">{taskTime(task)}</span>
              </li>
            );
          })}
          {total > VISIBLE && <li className="text-xs text-ink-faint">+{total - VISIBLE} more</li>}
        </ul>
      </div>
    )}
  </HomeCard>
);

TodayTasksCard.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    dueDate: PropTypes.string,
  })).isRequired,
  completed: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
};

export default TodayTasksCard;
