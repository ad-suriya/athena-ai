import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  PanelLeft,
  MessageCircle,
  MoreVertical,
  Edit,
  Share,
  Star,
  Trash2,
  ExternalLink,
  Archive as ArchiveIcon,
  BookOpen,
  Home as HomeIcon,
  HelpCircle as SupportIcon,
  Lightbulb as KnowledgeIcon,
  Mail as FeedbackIcon,
  Settings as SettingsIcon,
  X,
} from "lucide-react";

// Tooltip Component
const Tooltip = ({ children, text, position = "top" }) => {
  return (
    <div className="relative group">
      {children}
      <div className={`
        absolute z-[200] px-2 py-1 text-xs text-white bg-gray-900 rounded
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        pointer-events-none whitespace-nowrap
        ${position === "top" ? "bottom-full mb-1 left-1/2 transform -translate-x-1/2" : ""}
        ${position === "bottom" ? "top-full mt-1 left-1/2 transform -translate-x-1/2" : ""}
        ${position === "left" ? "right-full mr-1 top-1/2 transform -translate-y-1/2" : ""}
        ${position === "right" ? "left-full ml-1 top-1/2 transform -translate-y-1/2" : ""}
      `}>
        {text}
        <div className={`
          absolute w-0 h-0
          ${position === "top" ? "top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" : ""}
          ${position === "bottom" ? "bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900" : ""}
          ${position === "left" ? "left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900" : ""}
          ${position === "right" ? "right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900" : ""}
        `} />
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error("Error caught in Knowledge Modal:", error); // Log for debugging
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">
          <h3>Error in Knowledge Modal</h3>
          <p>{this.state.error?.message || "An unexpected error occurred"}</p>
          <button
            className="mt-2 px-4 py-2 bg-[#EBEBEB] text-gray-800 rounded-lg"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// SearchModal Component
const SearchModal = ({ isOpen, onClose, conversations, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  const filteredConversations = sortedConversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.preview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md mt-20 max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-300 flex items-center bg-[#EBEBEB]">
          <Search className="text-gray-400 mr-2 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="flex-1 outline-none text-sm bg-[#EBEBEB]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchTerm ? "No matches found" : "Start typing to search"}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="p-3 hover:bg-gray-200 cursor-pointer border-b border-gray-300"
                onClick={() => {
                  onSelect(conv.id);
                  onClose();
                }}
              >
                <div className="font-medium text-sm text-gray-900">{conv.title || `Conversation ${conv.id}`}</div>
                <div className="text-xs text-gray-500 truncate">{conv.preview}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// KnowledgeModal Component
const KnowledgeModal = ({ isOpen, onClose, setShowSidebarOverlay = () => {}, setIsSidebarVisible = () => {} }) => {
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', content: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
  }, [isOpen, setShowSidebarOverlay, setIsSidebarVisible]);

  if (!isOpen) return null;

  const handleAddKnowledge = () => {
    if (newEntry.name.trim() && newEntry.content.trim() && knowledgeEntries.length < 20) {
      const entry = {
        id: Date.now(),
        name: newEntry.name,
        content: newEntry.content,
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: 'Active',
      };
      setKnowledgeEntries((prev) => [...prev, entry]);
      setNewEntry({ name: '', content: '' });
      setShowAddForm(false);
    } else if (knowledgeEntries.length >= 20) {
      console.warn("Maximum knowledge entries (20) reached");
    }
  };

  const handleDeleteEntry = (id) => {
    setKnowledgeEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const filteredEntries = knowledgeEntries.filter(
    (entry) =>
      entry?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-[#EBEBEB]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Knowledge</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
              disabled={knowledgeEntries.length >= 20 || showAddForm}
            >
              <Plus className="w-4 h-4" />
              Add knowledge
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-[#EBEBEB] border-b border-gray-300">
          <p className="text-sm text-gray-600 leading-relaxed">
            Store personalized knowledge entries to enhance task assistance.
          </p>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            {knowledgeEntries.length} / 20 entries
          </div>
        </div>
        <div className="px-6 py-3 bg-[#EBEBEB] border-b border-gray-300">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-3">Name</div>
            <div className="col-span-4">Content</div>
            <div className="col-span-2">Created at</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-300 bg-gray-200">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="Knowledge name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-sm"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="col-span-4">
                  <textarea
                    placeholder="Knowledge content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none bg-white text-sm"
                    rows={3}
                    value={newEntry.content}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
                <div className="col-span-1 flex gap-2">
                  <button
                    onClick={handleAddKnowledge}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    disabled={!newEntry.name.trim() || !newEntry.content.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEntry({ name: '', content: '' });
                    }}
                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {filteredEntries.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <KnowledgeIcon className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first knowledge entry to get started
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
              >
                <Plus className="w-4 h-4" />
                Add knowledge
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="px-6 py-4 border-b border-gray-300 hover:bg-gray-200"
              >
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {entry.name || "Unnamed"}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {entry.content || "No content"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">{entry.createdAt || "N/A"}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {entry.status || "Unknown"}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-300 bg-[#EBEBEB]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Enhance task assistance with personalized knowledge
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toolbar Component
const Toolbar = ({ navigate, handleKnowledgeOpen }) => {
  const handleNavigate = (path) => {
    navigate(`/${path}`);
  };

  return (
    <div className="border-t border-gray-300 bg-[#EBEBEB] p-2 flex justify-around">
      <Tooltip text="Home Page" position="top">
        <button
          onClick={() => {
          window.location.href = 'https://yudle.vercel.app/';
        }}
        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
      >
          <HomeIcon className="w-5 h-5 text-gray-600" />
        </button>
      </Tooltip>
      <Tooltip text="Get help" position="top">
        <button
          onClick={() => handleNavigate("support")}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <SupportIcon className="w-5 h-5 text-gray-600" />
        </button>
      </Tooltip>
      <Tooltip text="Knowledge" position="top">
        <button
          onClick={handleKnowledgeOpen}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <KnowledgeIcon className="w-5 h-5 text-gray-600" />
        </button>
      </Tooltip>
      <Tooltip text="Feedback" position="top">
        <button
          onClick={() => handleNavigate("feedback")}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <FeedbackIcon className="w-5 h-5 text-gray-600" />
        </button>
      </Tooltip>
      <Tooltip text="Settings" position="top">
        <button
          onClick={() => handleNavigate("settings")}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <SettingsIcon className="w-5 h-5 text-gray-600" />
        </button>
      </Tooltip>
    </div>
  );
};

// Sidebar Component
const Sidebar1 = React.forwardRef(
  (
    {
      isSidebarVisible,
      isMobile,
      showSidebarOverlay,
      toggleSidebar,
      userConversations,
      currentConversationId,
      loadConversation,
      startNewChat,
      currentView,
      setCurrentView,
      setShowSidebarOverlay,
      setIsSidebarVisible,
      deleteConversation,
      renameConversation,
      toggleFavorite,
      toggleArchive,
    },
    ref
  ) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isRenaming, setIsRenaming] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
    const menuRefs = useRef({});
    const navigate = useNavigate();

    // Close menus when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (openMenuId) {
          const menuRef = menuRefs.current[openMenuId];
          if (menuRef && !menuRef.contains(event.target)) {
            const isThreeDotButton = event.target.closest('[data-menu-button]');
            if (!isThreeDotButton) {
              setOpenMenuId(null);
            }
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [openMenuId]);

    // Ctrl + K Shortcut for New Task
    useEffect(() => {
      const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "k") {
          event.preventDefault();
          startNewChat();
          if (isMobile) {
            setShowSidebarOverlay(false);
            setIsSidebarVisible(false);
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [startNewChat, isMobile, setShowSidebarOverlay, setIsSidebarVisible]);

    const sortedConversations = [...userConversations].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });

    useEffect(() => {
      const validViews = ["All", "Favorites", "Scheduled"];
      if (!validViews.includes(currentView)) {
        setCurrentView("All");
      }
    }, [currentView, setCurrentView]);

    const handleContextMenu = (e, conversationId) => {
      e.stopPropagation();
      setOpenMenuId(openMenuId === conversationId ? null : conversationId);
    };

    const handleRenameStart = (e, conversation) => {
      e.stopPropagation();
      setIsRenaming(conversation.id);
      setNewTitle(conversation.title || `Conversation ${conversation.id}`);
      setOpenMenuId(null);
    };

    const handleRenameSubmit = (e, conversationId) => {
      e.stopPropagation();
      if (newTitle.trim()) {
        renameConversation(conversationId, newTitle);
      }
      setIsRenaming(null);
    };

    const handleKeyDown = (e, conversationId) => {
      if (e.key === "Enter") {
        handleRenameSubmit(e, conversationId);
      } else if (e.key === "Escape") {
        setIsRenaming(null);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return "";
      }
    };

    const handleSearchSelect = (conversationId) => {
      loadConversation(conversationId);
      if (isMobile) {
        setShowSidebarOverlay(false);
        setIsSidebarVisible(false);
      }
    };

    const handleKnowledgeOpen = () => {
      setIsKnowledgeOpen(true);
    };

    return (
      <>
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          conversations={sortedConversations}
          onSelect={handleSearchSelect}
        />
        <ErrorBoundary>
          <KnowledgeModal
            isOpen={isKnowledgeOpen}
            onClose={() => setIsKnowledgeOpen(false)}
            setShowSidebarOverlay={setShowSidebarOverlay}
            setIsSidebarVisible={setIsSidebarVisible}
          />
        </ErrorBoundary>
        {isMobile && showSidebarOverlay && (
          <div
            className="fixed inset-0 bg-black/30 z-[50] md:hidden"
            onClick={() => {
              setShowSidebarOverlay(false);
              setIsSidebarVisible(false);
            }}
          />
        )}
        <div
          ref={ref}
          className={`
            fixed md:relative
            bg-[#EBEBEB] backdrop-blur-sm
            flex flex-col h-full z-[50]
            transition-all duration-300 ease-in-out
            ${isMobile ? "w-64" : "w-80"}
            ${isMobile ? (showSidebarOverlay ? "translate-x-0" : "-translate-x-full") : ""}
            ${!isMobile && !isSidebarVisible ? "md:w-0 md:overflow-hidden" : ""}
            rounded-r-2xl md:rounded-r-3xl
            shadow-md
            overflow-hidden
          `}
        >
          <div className="flex flex-col h-full">
            {/* Top Section */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <Tooltip text="Undock" position="bottom">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {isSidebarVisible ? (
                      <PanelLeft className="w-5 h-5 text-gray-600" />
                    ) : (
                      <PanelLeft className="w-5 h-5 text-gray-600 rotate-180" />
                    )}
                  </button>
                </Tooltip>
                <Tooltip text="Search" position="bottom">
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                </Tooltip>
              </div>
              <button
                onClick={() => {
                  startNewChat();
                  if (isMobile) {
                    setShowSidebarOverlay(false);
                    setIsSidebarVisible(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors mt-4"
              >
                <Plus className="w-4 h-4" />
                New Task
                <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  Ctrl+K
                </span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 py-2">
              <div className="flex bg-gray-200 rounded-full p-1">
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all ${
                    currentView === "All"
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setCurrentView("All")}
                >
                  All
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all ${
                    currentView === "Favorites"
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setCurrentView("Favorites")}
                >
                  Favorites
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all ${
                    currentView === "Scheduled"
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setCurrentView("Scheduled")}
                >
                  Scheduled
                </button>
              </div>
            </div>

            {/* Scrollable Conversation History */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-3">
                {sortedConversations.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No conversations yet</p>
                ) : (
                  sortedConversations
                    .filter((conv) => {
                      if (currentView === "Favorites") return conv.isFavorite;
                      if (currentView === "Scheduled") return conv.isScheduled;
                      return true;
                    })
                    .map((conv) => (
                      <div
                        key={conv.id}
                        className={`group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          currentConversationId === conv.id
                            ? "bg-white border border-gray-300"
                            : "hover:bg-gray-200"
                        }`}
                        onClick={() => {
                          loadConversation(conv.id);
                          if (isMobile) {
                            setShowSidebarOverlay(false);
                            setIsSidebarVisible(false);
                          }
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {isRenaming === conv.id ? (
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              onBlur={(e) => handleRenameSubmit(e, conv.id)}
                              onKeyDown={(e) => handleKeyDown(e, conv.id)}
                              className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-500 focus:outline-none focus:border-gray-700"
                              autoFocus
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {conv.title || `Conversation ${conv.id}`}
                              {conv.isFavorite && (
                                <Star className="w-3 h-3 ml-1 inline fill-yellow-400 text-yellow-400" />
                              )}
                            </p>
                          )}
                          {conv.preview && (
                            <p className="text-xs text-gray-500 mt-1 truncate">{conv.preview}</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatDate(conv.updatedAt || conv.createdAt)}
                          </p>
                        </div>
                        <div className="relative">
                          <button
                            data-menu-button
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
                            onClick={(e) => handleContextMenu(e, conv.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === conv.id && (
                            <div
                              ref={el => menuRefs.current[conv.id] = el}
                              className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-[100]"
                            >
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(window.location.href);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Share className="w-4 h-4 mr-2" /> Share
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                                onClick={(e) => handleRenameStart(e, conv)}
                              >
                                <Edit className="w-4 h-4 mr-2" /> Rename
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleArchive(conv.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <ArchiveIcon className="w-4 h-4 mr-2" />
                                {conv.isArchived ? "Unarchive" : "Archive"}
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(conv.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                {conv.isFavorite ? "Remove favorite" : "Add to favorites"}
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(window.location.href, "_blank");
                                  setOpenMenuId(null);
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" /> Open in new tab
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-200 w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(conv.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Toolbar Section */}
            <Toolbar navigate={navigate} handleKnowledgeOpen={handleKnowledgeOpen} />
          </div>
        </div>
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";
export default Sidebar1;