import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, Search, X } from 'lucide-react';
import ConversationListItem from './ConversationListItem';
import { filterAndSortConversations, groupConversations } from './conversationListUtils';
import { conversationShape } from './sidebarPropTypes';

const VIEWS = ["All", "Favorites", "Scheduled"];

// Slide-out "Conversation History" panel: search, view tabs, and the conversation list.
// The view (currentView/setCurrentView) is owned by the page; it resets to "All" on open.
const ConversationPanel = ({
  isOpen,
  onClose,
  userConversations,
  currentConversationId,
  loadConversation,
  currentView,
  setCurrentView,
  isMobile,
  setShowSidebarOverlay,
  setIsSidebarVisible,
  deleteConversation,
  renameConversation,
  toggleFavorite,
  toggleArchive,
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState(currentConversationId);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentView("All");
    }
  }, [isOpen, setCurrentView]);

  const grouped = groupConversations(filterAndSortConversations(userConversations, searchTerm), currentView);
  const visibleConversations = [...grouped.favoritesAndScheduled, ...grouped.others];

  const handleSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
    loadConversation(conversationId);
    if (isMobile) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
    onClose();
  };

  const handleRenameStart = (e, conversation) => {
    e.stopPropagation();
    setRenamingId(conversation.id);
    setNewTitle(conversation.title || `Conversation ${conversation.id}`);
    setOpenMenuId(null);
  };

  const handleRenameSubmit = (e, conversationId) => {
    e.stopPropagation();
    if (newTitle.trim()) {
      renameConversation(conversationId, newTitle);
    }
    setRenamingId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-[280px] h-full w-72 bg-white/90 backdrop-blur-xl border-l border-[#FFE7E5] shadow-xl z-50 flex transform transition-all duration-300 ease-in-out">
      <div className="w-full flex flex-col">
        <div className="p-4 border-b border-[#FFE7E5] bg-white/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#2B3440]">Conversation History</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#FFE7E5] rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-3 py-3 border-b border-[#FFE7E5]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 focus:border-transparent bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="flex bg-[#FFE7E5] rounded-lg p-0.5">
            {VIEWS.map((view) => (
              <button
                key={view}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
                  currentView === view
                    ? "bg-white text-[#FF6F61] shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setCurrentView(view)}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {visibleConversations.length > 0 ? (
            <div className="space-y-1.5">
              {visibleConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversationId === conversation.id}
                  onSelect={handleSelect}
                  isMenuOpen={openMenuId === conversation.id}
                  onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                  onCloseMenu={() => setOpenMenuId(null)}
                  isRenaming={renamingId === conversation.id}
                  renameValue={newTitle}
                  onRenameChange={setNewTitle}
                  onRenameStart={handleRenameStart}
                  onRenameSubmit={handleRenameSubmit}
                  onToggleFavorite={toggleFavorite}
                  onToggleArchive={toggleArchive}
                  onDelete={deleteConversation}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <MessageSquare className="w-12 h-12 mb-3" />
              <p className="text-sm">No {currentView.toLowerCase()} conversations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ConversationPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userConversations: PropTypes.arrayOf(conversationShape).isRequired,
  currentConversationId: PropTypes.string,
  loadConversation: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  setShowSidebarOverlay: PropTypes.func.isRequired,
  setIsSidebarVisible: PropTypes.func.isRequired,
  deleteConversation: PropTypes.func.isRequired,
  renameConversation: PropTypes.func.isRequired,
  toggleFavorite: PropTypes.func.isRequired,
  toggleArchive: PropTypes.func.isRequired,
};

export default ConversationPanel;
