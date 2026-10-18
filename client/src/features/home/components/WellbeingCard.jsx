import PropTypes from 'prop-types';
import { Heart, Lightbulb, Smile } from 'lucide-react';
import HomeCard from './HomeCard';
import ProgressRing from './ProgressRing';
import { checkInLine, moodLabel } from '../utils/homeUtils';

const Score = ({ label, value, color, children }) => (
  <div className="flex flex-col items-center gap-2">
    <ProgressRing value={value == null ? 0 : value / 10} size={84} stroke={7} color={color}>{children}</ProgressRing>
    <span className="text-sm text-ink-muted">{label}</span>
  </div>
);

Score.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number, color: PropTypes.string.isRequired, children: PropTypes.node };

// Latest mood check-in as three 1–10 rings, and a line about this week's check-ins.
const WellbeingCard = ({ latest, weekCount, isLoading, error, onCheckIn }) => (
  <HomeCard icon={Heart} title="Your Wellbeing" action={{ label: 'View insights', to: '/insights' }}>
    {error ? (
      <p className="text-sm text-brand-600">Couldn&apos;t load check-ins. {error}</p>
    ) : isLoading ? (
      <p className="text-sm text-ink-faint">Loading…</p>
    ) : !latest ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
        <p className="text-sm text-ink-muted">No check-ins this week yet.</p>
        <button type="button" onClick={onCheckIn} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100">
          Check in now
        </button>
      </div>
    ) : (
      <>
        <div className="flex justify-around gap-2">
          <Score label="Mood" value={latest.mood} color="#2EB67D">
            <Smile className="h-5 w-5 text-[#2EB67D]" strokeWidth={2} />
            <span className="text-sm font-semibold text-ink">{moodLabel(latest.mood)}</span>
          </Score>
          <Score label="Energy" value={latest.energy} color="#3B9BEA">
            <span className="text-lg font-semibold tabular-nums text-ink">{latest.energy ?? '—'}/10</span>
          </Score>
          <Score label="Stress" value={latest.stress} color="#F4A07A">
            <span className="text-lg font-semibold tabular-nums text-ink">{latest.stress ?? '—'}/10</span>
          </Score>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#FFF6F1] px-4 py-3">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-ink">{checkInLine(weekCount)}</p>
        </div>
      </>
    )}
  </HomeCard>
);

WellbeingCard.propTypes = {
  latest: PropTypes.shape({ mood: PropTypes.number, energy: PropTypes.number, stress: PropTypes.number }),
  weekCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onCheckIn: PropTypes.func.isRequired,
};

export default WellbeingCard;
