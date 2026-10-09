import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, Feather, Smile, Sparkles } from 'lucide-react';

// Shortcut tiles under Ask Athena. "Check my mood" opens the check-in dialog;
// the rest open the matching screen with a preset.
const ACTIONS = [
  { id: 'mood', title: 'Check my mood', text: 'How are you feeling?', icon: Smile, tile: 'bg-brand-50', bubble: 'bg-brand-100 text-brand-500' },
  { id: 'journal', title: 'New journal entry', text: 'Reflect your thoughts', icon: BookOpen, tile: 'bg-[#F5F2FD]', bubble: 'bg-[#E9E2FB] text-[#7B5CD6]', to: '/notes?new=1' },
  { id: 'plan', title: 'Plan my day', text: 'Tasks & schedule', icon: CalendarCheck, tile: 'bg-[#EFF8F3]', bubble: 'bg-[#DDF1E5] text-[#2E9A62]', to: '/tasks' },
  { id: 'calm', title: 'Help me calm down', text: 'Breathing & meditation', icon: Feather, tile: 'bg-[#EEF5FD]', bubble: 'bg-[#DCEAFB] text-[#3B82D6]', to: '/chat', state: { category: 'calm' } },
  { id: 'ask', title: 'Ask Athena', text: 'Get a suggestion', icon: Sparkles, tile: 'bg-[#FFF7EC]', bubble: 'bg-[#FFEBD0] text-[#E08A1E]', to: '/chat', state: { category: 'choice' } },
];

const tileClass = (a) => `flex items-center gap-4 rounded-2xl border border-line/60 px-4 py-4 text-left transition-shadow hover:shadow-card ${a.tile}`;

const Tile = ({ action }) => (
  <>
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${action.bubble}`}>
      <action.icon className="h-6 w-6" strokeWidth={1.8} />
    </span>
    <span className="min-w-0">
      <span className="block truncate text-[15px] font-semibold text-ink">{action.title}</span>
      <span className="block truncate text-sm text-ink-muted">{action.text}</span>
    </span>
  </>
);

Tile.propTypes = { action: PropTypes.object.isRequired };

const QuickActions = ({ onCheckMood }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
    {ACTIONS.map((a) => (a.id === 'mood' ? (
      <button key={a.id} type="button" onClick={onCheckMood} className={tileClass(a)}><Tile action={a} /></button>
    ) : (
      <Link key={a.id} to={a.to} state={a.state} className={tileClass(a)}><Tile action={a} /></Link>
    )))}
  </div>
);

QuickActions.propTypes = { onCheckMood: PropTypes.func.isRequired };

export default QuickActions;
