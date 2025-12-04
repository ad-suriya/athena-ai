import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Code2 } from 'lucide-react';
import {
  Plus,
  Search,
  PanelLeft,
  Home as HomeIcon,
  Mail as FeedbackIcon,
  HelpCircle as SupportIcon,
  Settings as SettingsIcon,
  FileText,
  ChevronDown,
  X,
  Clock as ClockIcon,
  MessageSquare,
  ChevronsRight,
  Send,
  MessageCircle,
  MoreVertical,
  Edit,
  Share,
  Star,
  Trash2,
  ExternalLink,
  Archive as ArchiveIcon,
  BookOpen,
} from "lucide-react";

// Tooltip Component
const Tooltip = ({ children, text, position = "top" }) => {
  return (
    <div className="relative group">
      {children}
      <div
        className={`
          absolute z-[200] px-1.5 py-0.5 text-[10px] text-white bg-gray-900 rounded
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap
          ${position === "top" ? "bottom-full mb-1 left-1/2 transform -translate-x-1/2" : ""}
          ${position === "right" ? "left-full ml-1 top-1/2 transform -translate-y-1/2" : ""}
        `}
      >
        {text}
        <div
          className={`
            absolute w-0 h-0
            ${position === "top" ? "top-full left-1/2 transform -translate-x-1/2 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-gray-900" : ""}
            ${position === "right" ? "right-full top-1/2 transform -translate-y-1/2 border-t-3 border-b-3 border-r-3 border-t-transparent border-b-transparent border-r-gray-900" : ""}
          `}
        />
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error("Error in component:", error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 text-red-600">
          <h3 className="text-sm">Error in Sidebar</h3>
          <p className="text-xs">{this.state.error?.message || "An unexpected error occurred"}</p>
          <button
            className="mt-2 px-3 py-1 bg-[#EBEBEB] text-gray-800 rounded-md text-xs"
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

// Enhanced Conversation Panel Component
const ConversationPanel = ({ 
  isOpen, 
  onClose, 
  user, 
  userConversations = [], 
  currentConversationId,
  loadConversation,
  currentView,
  isMobile,
  setShowSidebarOverlay,
  setIsSidebarVisible,
  deleteConversation,
  renameConversation,
  toggleFavorite,
  toggleArchive,
  setCurrentView,
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState(currentConversationId);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isRenaming, setIsRenaming] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const menuRefs = useRef({});

  // Ensure "All" is selected by default when the panel opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView("All");
    }
  }, [isOpen, setCurrentView]);

  // Sort and filter conversations based on search term
  const sortedConversations = [...userConversations]
    .filter(
      (conv) =>
        conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.preview?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });

  // Filter and prioritize conversations
  const filteredConversations = sortedConversations.reduce((acc, conv) => {
    if (currentView === "All") {
      if (conv.isFavorite || conv.isScheduled) {
        acc.favoritesAndScheduled.push(conv);
      } else {
        acc.others.push(conv);
      }
    } else if (currentView === "Favorites" && conv.isFavorite) {
      acc.favoritesAndScheduled.push(conv);
    } else if (currentView === "Scheduled" && conv.isScheduled) {
      acc.favoritesAndScheduled.push(conv);
    }
    return acc;
  }, { favoritesAndScheduled: [], others: [] });

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
    loadConversation(conversationId);
    if (isMobile) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
    // Close conversation panel after selection
    onClose();
  };

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

  // Navigation Tabs Component
  const NavigationTabs = () => (
    <div className="px-3 py-2 border-b border-gray-200">
      <div className="flex bg-gray-200 rounded-full p-0.5">
        <button
          className={`flex-1 py-1.5 px-2 text-[10px] font-medium rounded-full transition-all ${
            currentView === "All"
              ? "bg-gray-800 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setCurrentView("All")}
        >
          All
        </button>
        <button
          className={`flex-1 py-1.5 px-2 text-[10px] font-medium rounded-full transition-all ${
            currentView === "Favorites"
              ? "bg-gray-800 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setCurrentView("Favorites")}
        >
          Favorites
        </button>
        <button
          className={`flex-1 py-1.5 px-2 text-[10px] font-medium rounded-full transition-all ${
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
  );

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-[200px] h-full w-64 bg-white border-l border-gray-200 shadow-lg z-50 flex transform transition-all duration-300 ease-in-out">
      {/* Conversation List */}
      <div className="w-full flex flex-col">
        <div className="p-3 border-b border-gray-200 bg-[#EBEBEB]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Conversation History</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="px-3 py-1.5 border-b border-gray-200">
          <div className="relative w-full">
            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-7 pr-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <NavigationTabs />
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.favoritesAndScheduled.length > 0 || filteredConversations.others.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredConversations.favoritesAndScheduled.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedConversationId === conversation.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isRenaming === conversation.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={(e) => handleRenameSubmit(e, conversation.id)}
                        onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                        className="w-full text-xs font-medium text-gray-800 bg-transparent border-b border-gray-500 focus:outline-none focus:border-gray-700"
                        autoFocus
                      />
                    ) : (
                      <p className="text-xs font-medium truncate flex items-center gap-1">
                        {conversation.title || `Conversation ${conversation.id}`}
                        {conversation.isFavorite && (
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        )}
                      </p>
                    )}
                    {conversation.preview && (
                      <p className="text-[10px] text-gray-500 truncate">{conversation.preview}</p>
                    )}
                    <p className="text-[9px] text-gray-400">
                      {formatDate(conversation.updatedAt || conversation.createdAt)}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      data-menu-button
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all"
                      onClick={(e) => handleContextMenu(e, conversation.id)}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                    {openMenuId === conversation.id && (
                      <div
                        ref={el => menuRefs.current[conversation.id] = el}
                        className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-[100]"
                      >
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => handleRenameStart(e, conversation)}
                        >
                          <Edit className="w-3 h-3 mr-2" /> Rename
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Star className="w-3 h-3 mr-2" />
                          {conversation.isFavorite ? "Remove favorite" : "Add to favorites"}
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <ArchiveIcon className="w-3 h-3 mr-2" />
                          {conversation.isArchived ? "Unarchive" : "Archive"}
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.href);
                            setOpenMenuId(null);
                          }}
                        >
                          <Share className="w-3 h-3 mr-2" /> Share
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-red-600 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredConversations.others.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedConversationId === conversation.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isRenaming === conversation.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={(e) => handleRenameSubmit(e, conversation.id)}
                        onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                        className="w-full text-xs font-medium text-gray-800 bg-transparent border-b border-gray-500 focus:outline-none focus:border-gray-700"
                        autoFocus
                      />
                    ) : (
                      <p className="text-xs font-medium truncate flex items-center gap-1">
                        {conversation.title || `Conversation ${conversation.id}`}
                        {conversation.isFavorite && (
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        )}
                      </p>
                    )}
                    {conversation.preview && (
                      <p className="text-[10px] text-gray-500 truncate">{conversation.preview}</p>
                    )}
                    <p className="text-[9px] text-gray-400">
                      {formatDate(conversation.updatedAt || conversation.createdAt)}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      data-menu-button
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all"
                      onClick={(e) => handleContextMenu(e, conversation.id)}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                    {openMenuId === conversation.id && (
                      <div
                        ref={el => menuRefs.current[conversation.id] = el}
                        className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-[100]"
                      >
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => handleRenameStart(e, conversation)}
                        >
                          <Edit className="w-3 h-3 mr-2" /> Rename
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Star className="w-3 h-3 mr-2" />
                          {conversation.isFavorite ? "Remove favorite" : "Add to favorites"}
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <ArchiveIcon className="w-3 h-3 mr-2" />
                          {conversation.isArchived ? "Unarchive" : "Archive"}
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.href);
                            setOpenMenuId(null);
                          }}
                        >
                          <Share className="w-3 h-3 mr-2" /> Share
                        </button>
                        <button
                          className="flex items-center px-3 py-1.5 text-xs text-red-600 hover:bg-gray-200 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-8 h-8 mb-2" />
              <p className="text-sm">No {currentView.toLowerCase()} conversations</p>
            </div>
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
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-[#EBEBEB]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">Knowledge</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>
        <div className="px-3 py-1.5 bg-[#EBEBEB] border-b border-gray-300">
          <p className="text-xs text-gray-600">Store personalized knowledge entries.</p>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-300">
          <div className="relative w-40">
            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge..."
              className="w-full pl-7 pr-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-gray-500">{knowledgeEntries.length} / 20 entries</div>
        </div>
        <div className="px-3 py-1.5 bg-[#EBEBEB] border-b border-gray-300">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
            <div className="col-span-3">Name</div>
            <div className="col-span-4">Content</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '40vh' }}>
          {showAddForm && (
            <div className="px-3 py-1.5 border-b border-gray-300 bg-gray-100">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="Name..."
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-gray-500"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="col-span-4">
                  <textarea
                    placeholder="Content..."
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                    rows={2}
                    value={newEntry.content}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
                <div className="col-span-1 flex gap-1">
                  <button
                    onClick={handleAddKnowledge}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                    disabled={!newEntry.name.trim() || !newEntry.content.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEntry({ name: '', content: '' });
                    }}
                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {filteredEntries.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FileText className="w-5 h-5 text-gray-500 mb-2" />
              <p className="text-xs text-gray-500">No knowledge entries yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 flex items-center gap-1 px-2 py-1 bg-white text-gray-800 rounded-md text-xs font-medium border border-gray-300 hover:bg-gray-200"
              >
                <Plus className="w-3 h-3" />
                Add knowledge
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="px-3 py-1.5 border-b border-gray-300 hover:bg-gray-100">
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3 text-xs font-medium text-gray-900 truncate">{entry.name}</div>
                  <div className="col-span-4 text-xs text-gray-600 line-clamp-2">{entry.content}</div>
                  <div className="col-span-2 text-xs text-gray-500">{entry.createdAt}</div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                      {entry.status}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-3 py-1.5 border-t border-gray-300 bg-[#EBEBEB]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 px-2 py-1 bg-white text-gray-800 rounded-md text-xs font-medium border border-gray-300 hover:bg-gray-200"
              disabled={knowledgeEntries.length >= 20 || showAddForm}
            >
              <Plus className="w-3 h-3" />
              Add knowledge
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 bg-white text-gray-800 rounded-md text-xs font-medium border border-gray-300 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Sidebar Component
const Sidebar = ({
  isMobile = false,
  showSidebarOverlay = false,
  setShowSidebarOverlay = () => {},
  setIsSidebarVisible = () => {},
  isSidebarVisible = true,
  toggleSidebar = () => {},
  startNewChat = () => {},
  currentView = "All",
  setCurrentView = () => {},
  user = { displayName: "User" },
  userConversations = [],
  currentConversationId = null,
  loadConversation = () => {},
  deleteConversation = () => {},
  renameConversation = () => {},
  toggleFavorite = () => {},
  toggleArchive = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  // Close conversation panel when sidebar is toggled closed
  useEffect(() => {
    if (!isSidebarVisible && isConversationOpen) {
      setIsConversationOpen(false);
    }
  }, [isSidebarVisible, isConversationOpen]);

  // Enhanced startNewChat function that navigates to notes
  const enhancedStartNewChat = () => {
    if (!location.pathname.includes('/notes')) {
      navigate('/notes');
    }
    startNewChat();
  };

  // Fix home page navigation
  const handleHomePage = () => {
    window.location.href = 'https://yudle.vercel.app/';
  };

  // Ctrl+K Shortcut for New Page
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        enhancedStartNewChat();
        if (isMobile) {
          setShowSidebarOverlay(false);
          setIsSidebarVisible(false);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enhancedStartNewChat, isMobile, setShowSidebarOverlay, setIsSidebarVisible]);

  const handleNavigate = (path) => {
    navigate(`/${path}`);
    if (isMobile) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
  };

  const toggleConversation = () => {
    setIsConversationOpen(!isConversationOpen);
  };

  return (
    <ErrorBoundary>
      <KnowledgeModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
        setShowSidebarOverlay={setShowSidebarOverlay}
        setIsSidebarVisible={setIsSidebarVisible}
      />
      
      <ConversationPanel 
        isOpen={isConversationOpen} 
        onClose={() => setIsConversationOpen(false)}
        user={user}
        userConversations={userConversations}
        currentConversationId={currentConversationId}
        loadConversation={loadConversation}
        currentView={currentView}
        isMobile={isMobile}
        setShowSidebarOverlay={setShowSidebarOverlay}
        setIsSidebarVisible={setIsSidebarVisible}
        deleteConversation={deleteConversation}
        renameConversation={renameConversation}
        toggleFavorite={toggleFavorite}
        toggleArchive={toggleArchive}
        setCurrentView={setCurrentView}
      />
      
      {isMobile && showSidebarOverlay && (
        <div
          className="fixed inset-0 bg-black/30 z-[50] md:hidden"
          onClick={() => {
            setShowSidebarOverlay(false);
            setIsSidebarVisible(false);
            setIsConversationOpen(false);
          }}
        />
      )}
      
      {!isSidebarVisible && (
        <Tooltip text="Expand sidebar" position="right">
          <button
            onClick={toggleSidebar}
            className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 p-1 bg-gray-100 rounded-r-md border border-gray-200 border-l-0 shadow-sm hover:bg-gray-200 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="w-4 h-4 text-gray-600" />
          </button>
        </Tooltip>
      )}
      
      <div
        className={`
          fixed md:relative bg-gray-50 border-r border-gray-200 flex flex-col h-screen
          transition-all duration-300 ease-in-out z-[60]
          ${isMobile ? "w-64" : isSidebarVisible ? "w-[200px]" : "w-0 overflow-hidden"}
          ${isMobile && !showSidebarOverlay ? "-translate-x-full" : "translate-x-0"}
          rounded-r-2xl md:rounded-r-3xl
          shadow-md
          overflow-hidden
        `}
      >
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{user?.displayName?.[0] || "S"}</span>
              </div>
              <span className="font-medium text-xs text-gray-900">{user?.displayName || "Suriya's Notion"}</span>
              <button
                onClick={toggleConversation}
                className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                aria-label="Open conversation history"
              >
                <ClockIcon className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronsRight className="w-3 h-3 text-gray-600 rotate-180" />
            </button>
          </div>
        </div>

        <div className="p-2">
          <div className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 rounded p-1">
            <Search className="w-3 h-3" />
            <span className="text-xs">Search</span>
          </div>
        </div>

        <div className="px-2 space-y-1">
          <div
            className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 rounded p-1 cursor-pointer"
            onClick={() => handleNavigate('home')}
          >
            <HomeIcon className="w-3 h-3" />
            <span className="text-xs">Home</span>
          </div>
          <div
            className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 rounded p-1 cursor-pointer"
            onClick={() => handleNavigate('inbox')}
          >
            <FeedbackIcon className="w-3 h-3" />
            <span className="text-xs">Inbox</span>
          </div>
          <div
            className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 rounded p-1 cursor-pointer"
            onClick={() => handleNavigate('tasks')}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5h6m-6 0a1 1 0 011-1h2a1 1 0 011 1m-6 0h6m-6 3H7a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1h-1m-6 0h6m-6 3h6m-6 3h6m-6 3h6"
              />
            </svg>
            <span className="text-xs">Tasks</span>
          </div>
          <div
            className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 rounded p-1 cursor-pointer"
            onClick={() => handleNavigate('mindmap')}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-4a2 2 0 012-2h10a2 2 0 012 2v4h-4m-6 0h.01"
              />
            </svg>
            <span className="text-xs">Mind Map</span>
          </div>
        </div>

        <div className="px-2 mt-4">
          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Private
          </div>
          <div className="space-y-1">
            <div
              className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 rounded p-1 cursor-pointer"
              onClick={enhancedStartNewChat}
            >
              <FileText className="w-3 h-3" />
              <span className="text-xs">New Page</span>
            </div>
            <div
              className="flex items-center space-x-1.5 text-gray-500 hover:bg-gray-100 rounded p-1 cursor-pointer"
              onClick={() => handleNavigate('add-new')}
            >
              <Plus className="w-3 h-3" />
              <span className="text-xs">Add New+</span>
            </div>
          </div>
        </div>

        <div className="px-2 mt-4">
          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Shared
          </div>
          <div
            className="flex items-center space-x-1.5 text-gray-500 hover:bg-gray-100 rounded p-1 cursor-pointer"
            onClick={() => handleNavigate('collaborate')}
          >
            <Plus className="w-3 h-3" />
            <span className="text-xs">Start collaborating</span>
          </div>
        </div>
        <div
  className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 rounded p-1 cursor-pointer"
  onClick={() => handleNavigate('code-editor')}
>
  <Code2 className="w-3 h-3" />
  <span className="text-xs">Code Editor</span>
</div>

        <div className="mt-auto border-t border-gray-300 bg-[#EBEBEB] p-2 flex justify-around">
          <Tooltip text="HomePage" position="top">
            <button
              onClick={handleHomePage}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Home Page"
            >
              <HomeIcon className="w-3 h-3 text-gray-600" />
            </button>
          </Tooltip>
          <Tooltip text="Get Help" position="top">
            <button
              onClick={() => handleNavigate('support')}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Get Help"
            >
              <SupportIcon className="w-3 h-3 text-gray-600" />
            </button>
          </Tooltip>
          <Tooltip text="Knowledge" position="top">
            <button
              onClick={() => setIsKnowledgeOpen(true)}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Knowledge"
            >
              <FileText className="w-3 h-3 text-gray-600" />
            </button>
          </Tooltip>
          <Tooltip text="Feedback" position="top">
            <button
              onClick={() => handleNavigate('feedback')}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Feedback"
            >
              <FeedbackIcon className="w-3 h-3 text-gray-600" />
            </button>
          </Tooltip>
          <Tooltip text="Settings" position="top">
            <button
              onClick={() => handleNavigate('settings')}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-3 h-3 text-gray-600" />
            </button>
          </Tooltip>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Sidebar;