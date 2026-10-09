import PropTypes from 'prop-types';
import { Sun } from 'lucide-react';
import { greetingFor } from '../utils/homeUtils';

// Greeting with the user's first name, a one-line summary, and Athena's note of the day.
const HomeHeader = ({ firstName, summary }) => (
  <div className="grid items-center gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
    <div className="min-w-0">
      <h1 className="text-balance text-[32px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[40px]">
        {greetingFor(new Date())}, <span className="text-brand-500">{firstName}</span>
      </h1>
      <p className="mt-2 text-[17px] text-ink-muted sm:text-lg">{summary}</p>
    </div>
    <div className="relative overflow-hidden rounded-card border border-line bg-gradient-to-r from-[#FFF8F5] to-brand-50 px-7 py-6">
      <svg className="absolute bottom-0 right-0 h-full w-1/2" viewBox="0 0 280 100" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="205" cy="38" r="26" fill="#FBD9C9" opacity="0.8" />
        <path d="M60 100 C110 60 150 82 190 58 C230 36 260 60 280 52 L280 100 Z" fill="#F7C9BE" opacity="0.6" />
        <path d="M0 100 C70 78 120 96 170 78 C220 62 250 84 280 76 L280 100 Z" fill="#F2B0A3" opacity="0.5" />
      </svg>
      <div className="relative flex items-center gap-5">
        <Sun className="h-7 w-7 shrink-0 text-amber-400" strokeWidth={1.8} />
        <div>
          <p className="text-[16px] text-ink">Progress, not perfection.</p>
          <p className="mt-1 text-sm text-ink-muted">— Athena</p>
        </div>
      </div>
    </div>
  </div>
);

HomeHeader.propTypes = {
  firstName: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
};

export default HomeHeader;
