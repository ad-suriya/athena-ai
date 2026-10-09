import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Archive, Edit, MessageSquare, MoreVertical, Share, Star, Trash2 } from 'lucide-react';
import { formatConversationTime } from './conversationListUtils';
import { conversationShape } from './sidebarPropTypes';

const menuButtonClass = "flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg";

// One conversation in the history panel, with inline rename and a ⋮ action menu.
// Menu and rename state are owned by the panel so only one is open at a time.
const ConversationListItem = ({
  conversation,
  isSelected,
  onSelect,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameStart,
  onRenameSubmit,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
}) => {
  const menuRef = useRef(null);
  const isHighlighted = conversation.isFavorite || conversation.isScheduled;

  // Close the menu on outside clicks (except on any ⋮ button, which toggles).
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('[data-menu-button]')) {
        onCloseMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, onCloseMenu]);

  const menuAction = (action) => (e) => {
    e.stopPropagation();
    action();
    onCloseMenu();
  };

  return (
    <div
      className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#FF6F61]/10 border border-[#FF6F61]/20'
          : 'hover:bg-[#FFE7E5] border border-transparent'
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className={`w-8 h-8 ${isHighlighted ? 'bg-[#FF6F61]/10' : 'bg-gray-100'} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <MessageSquare className={`w-4 h-4 ${isHighlighted ? 'text-[#FF6F61]' : 'text-gray-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={(e) => onRenameSubmit(e, conversation.id)}
            onKeyDown={(e) => e.key === 'Enter' && onRenameSubmit(e, conversation.id)}
            className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#FF6F61]"
            autoFocus
          />
        ) : (
          <p className="text-sm font-medium truncate flex items-center gap-1.5">
            {conversation.title || `Conversation ${conversation.id}`}
            {conversation.isFavorite && (
              <Star className="w-3 h-3 fill-[#FF6F61] text-[#FF6F61] flex-shrink-0" />
            )}
          </p>
        )}
        {conversation.preview && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{conversation.preview}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {formatConversationTime(conversation.updatedAt || conversation.createdAt)}
        </p>
      </div>
      <div className="relative">
        <button
          data-menu-button
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(conversation.id);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] backdrop-blur-sm"
          >
            <button
              className={menuButtonClass}
              onClick={(e) => onRenameStart(e, conversation)}
            >
              <Edit className="w-4 h-4 mr-2" /> Rename
            </button>
            <button className={menuButtonClass} onClick={menuAction(() => onToggleFavorite(conversation.id))}>
              <Star className="w-4 h-4 mr-2" />
              {conversation.isFavorite ? "Remove favorite" : "Add to favorites"}
            </button>
            <button className={menuButtonClass} onClick={menuAction(() => onToggleArchive(conversation.id))}>
              <Archive className="w-4 h-4 mr-2" />
              {conversation.isArchived ? "Unarchive" : "Archive"}
            </button>
            <button className={menuButtonClass} onClick={menuAction(() => navigator.clipboard.writeText(window.location.href))}>
              <Share className="w-4 h-4 mr-2" /> Share
            </button>
            <button
              className="flex items-center px-3 py-2 text-sm text-[#FF6F61] hover:bg-[#FFE7E5] w-full text-left rounded-lg"
              onClick={menuAction(() => onDelete(conversation.id))}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

ConversationListItem.propTypes = {
  conversation: conversationShape.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  onToggleMenu: PropTypes.func.isRequired,
  onCloseMenu: PropTypes.func.isRequired,
  isRenaming: PropTypes.bool.isRequired,
  renameValue: PropTypes.string.isRequired,
  onRenameChange: PropTypes.func.isRequired,
  onRenameStart: PropTypes.func.isRequired,
  onRenameSubmit: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onToggleArchive: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ConversationListItem;
