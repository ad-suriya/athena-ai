import { Link } from 'react-router-dom';
import { Sparkles, Target } from 'lucide-react';
import HomeCard from './HomeCard';

// Cards for features that have no data behind them yet. They say so plainly
// instead of showing sample numbers.

export const AthenaSuggestsCard = () => (
  <HomeCard icon={Sparkles} title="Athena suggests">
    <div className="flex flex-1 flex-col justify-between gap-4 rounded-2xl bg-brand-50/70 p-5">
      <div>
        <p className="text-[15px] font-semibold text-ink">Personal suggestions are on the way</p>
        <p className="mt-1 text-sm text-ink-muted">Soon Athena will spot free time in your day and suggest what to do with it.</p>
      </div>
      <Link to="/chat" state={{ category: 'choice' }} className="self-start rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
        Ask for a suggestion now
      </Link>
    </div>
  </HomeCard>
);

export const FocusAreasCard = () => (
  <HomeCard icon={Target} title="Focus Areas">
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
      <p className="text-[15px] font-semibold text-ink">Coming soon</p>
      <p className="max-w-[28ch] text-sm text-ink-muted">Choose the parts of life you want to grow, like health or study, and track your progress here.</p>
    </div>
  </HomeCard>
);
