import PropTypes from 'prop-types';
import { History, SquarePen } from 'lucide-react';

// Chat's own toolbar inside the app shell: conversation history and a new chat.
export const ChatHeader = ({ historyOpen, onToggleHistory, onNewChat, title }) => (
  <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[#E65C52]/10 bg-white/60 px-4">
    <button
      onClick={onToggleHistory}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        historyOpen ? 'bg-brand-100 text-brand-600' : 'text-ink hover:bg-brand-50'
      }`}
      aria-expanded={historyOpen}
    >
      <History className="h-4 w-4" />
      History
    </button>
    <button
      onClick={onNewChat}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50"
    >
      <SquarePen className="h-4 w-4" />
      New chat
    </button>
    {title && <p className="ml-2 min-w-0 truncate text-sm text-ink-muted">{title}</p>}
  </div>
);

ChatHeader.propTypes = {
  historyOpen: PropTypes.bool.isRequired,
  onToggleHistory: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
  title: PropTypes.string,
};
