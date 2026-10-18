import React from 'react';
import { MessageSquare } from 'lucide-react';

const TemporaryChatButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-200 dark:border-gray-700"
      title="Start a temporary chat (not saved)"
    >
      <MessageSquare className="w-4 h-4" />
      <span className="hidden sm:inline">Temporary Chat</span>
    </button>
  );
};

export default TemporaryChatButton;