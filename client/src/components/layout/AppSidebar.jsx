import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import logo from '../../assets/logo-07.png';
import { MAIN_NAV, WELLNESS_TOOLS } from './navItems';

const itemClass = (active) =>
  `flex items-center gap-4 rounded-xl px-4 py-3 text-[15.5px] transition-colors ${
    active ? 'bg-brand-100/70 font-semibold text-brand-500' : 'text-ink hover:bg-brand-50'
  }`;

// App navigation: brand, main sections, wellness tools and a closing note card.
// From lg up it is a fixed column; below lg it slides in as a drawer.
const AppSidebar = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const isActive = (item) => item.match.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px] lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-[#FFFAF9] transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-6 pb-6 pt-6">
          <Link to="/home" className="flex items-center gap-3" onClick={onClose}>
            <img src={logo} alt="" className="h-12 w-12 object-contain" />
            <div className="leading-tight">
              <div className="text-[22px] font-bold text-brand-500">Athena AI</div>
              <div className="text-[11px] tracking-[0.18em] text-ink-faint">Think · Feel · Do</div>
            </div>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          <ul className="space-y-1">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={itemClass(isActive(item))} onClick={onClose} aria-current={isActive(item) ? 'page' : undefined}>
                  <item.icon className="h-5 w-5 shrink-0" strokeWidth={isActive(item) ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mx-3 my-6 h-px bg-line" />

          <p className="mb-2 px-3.5 text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">Wellness tools</p>
          <ul className="space-y-1">
            {WELLNESS_TOOLS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} state={item.state} className={itemClass(false)} onClick={onClose}>
                  <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4">
          <div className="relative overflow-hidden rounded-card bg-gradient-to-b from-brand-50 to-brand-100 px-5 pb-5 pt-[104px]">
            <svg className="absolute inset-x-0 top-0 h-28 w-full" viewBox="0 0 240 112" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="hill-fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4B3A8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#F4B3A8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 58 C40 28 70 68 110 43 C150 18 190 53 240 33 L240 112 L0 112 Z" fill="url(#hill-fade)" opacity="0.7" />
              <path d="M0 74 C50 54 90 84 140 61 C180 44 210 69 240 57 L240 112 L0 112 Z" fill="url(#hill-fade)" />
            </svg>
            <p className="relative text-[17px] leading-snug text-ink-muted">A clearer mind<br />for a brighter you.</p>
            <Link
              to="/chat"
              state={{ category: 'calm' }}
              onClick={onClose}
              className="relative ml-auto mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-500 shadow-card hover:bg-brand-50"
              aria-label="Open calming tools"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

AppSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AppSidebar;
