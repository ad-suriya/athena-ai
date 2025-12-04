import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Profile from "../pages/profile/profile";
import {
  MessageSquare,
  Search,
  CheckSquare,
  Smile,
  BarChart3,
  BookOpen,
  Home as HomeIcon,
  Mail as FeedbackIcon,
  HelpCircle as SupportIcon,
  Settings as SettingsIcon,
  FileText,
  ChevronDown,
  X,
  Clock as ClockIcon,
  ChevronsRight,
  Plus,
  MoreVertical,
  Edit,
  Share,
  Star,
  Trash2,
  Archive as ArchiveIcon,
  Menu,
  Sparkles,
  Bookmark,
  Calendar,
  Users,
  Bell,
  LogOut,
  User
} from "lucide-react";

// Tooltip Component
const Tooltip = ({ children, text, position = "top" }) => {
  return (
    <div className="relative group">
      {children}
      <div
        className={`
          absolute z-[200] px-2 py-1 text-xs text-white bg-gray-900/90 rounded-lg
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap backdrop-blur-sm
          ${position === "top" ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2" : ""}
          ${position === "right" ? "left-full ml-2 top-1/2 transform -translate-y-1/2" : ""}
        `}
      >
        {text}
        <div
          className={`
            absolute w-0 h-0
            ${position === "top" ? "top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-900/90" : ""}
          `}
        />
      </div>
    </div>
  );
};

// Enhanced Conversation Panel Component (Updated for new theme)
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

  useEffect(() => {
    if (isOpen) {
      setCurrentView("All");
    }
  }, [isOpen, setCurrentView]);

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

  const NavigationTabs = () => (
    <div className="px-3 py-2">
      <div className="flex bg-[#FFE7E5] rounded-lg p-0.5">
        <button
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
            currentView === "All"
              ? "bg-white text-[#FF6F61] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setCurrentView("All")}
        >
          All
        </button>
        <button
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
            currentView === "Favorites"
              ? "bg-white text-[#FF6F61] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setCurrentView("Favorites")}
        >
          Favorites
        </button>
        <button
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
            currentView === "Scheduled"
              ? "bg-white text-[#FF6F61] shadow-sm"
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
        
        <NavigationTabs />
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredConversations.favoritesAndScheduled.length > 0 || filteredConversations.others.length > 0 ? (
            <div className="space-y-1.5">
              {filteredConversations.favoritesAndScheduled.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedConversationId === conversation.id 
                      ? 'bg-[#FF6F61]/10 border border-[#FF6F61]/20' 
                      : 'hover:bg-[#FFE7E5] border border-transparent'
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="w-8 h-8 bg-[#FF6F61]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-[#FF6F61]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isRenaming === conversation.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={(e) => handleRenameSubmit(e, conversation.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(e, conversation.id)}
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
                      {formatDate(conversation.updatedAt || conversation.createdAt)}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      data-menu-button
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
                      onClick={(e) => handleContextMenu(e, conversation.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === conversation.id && (
                      <div
                        ref={el => menuRefs.current[conversation.id] = el}
                        className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] backdrop-blur-sm"
                      >
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => handleRenameStart(e, conversation)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Rename
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {conversation.isFavorite ? "Remove favorite" : "Add to favorites"}
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <ArchiveIcon className="w-4 h-4 mr-2" />
                          {conversation.isArchived ? "Unarchive" : "Archive"}
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.href);
                            setOpenMenuId(null);
                          }}
                        >
                          <Share className="w-4 h-4 mr-2" /> Share
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-[#FF6F61] hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredConversations.others.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedConversationId === conversation.id 
                      ? 'bg-[#FF6F61]/10 border border-[#FF6F61]/20' 
                      : 'hover:bg-[#FFE7E5] border border-transparent'
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isRenaming === conversation.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={(e) => handleRenameSubmit(e, conversation.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(e, conversation.id)}
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
                      {formatDate(conversation.updatedAt || conversation.createdAt)}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      data-menu-button
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
                      onClick={(e) => handleContextMenu(e, conversation.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === conversation.id && (
                      <div
                        ref={el => menuRefs.current[conversation.id] = el}
                        className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] backdrop-blur-sm"
                      >
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => handleRenameStart(e, conversation)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Rename
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {conversation.isFavorite ? "Remove favorite" : "Add to favorites"}
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <ArchiveIcon className="w-4 h-4 mr-2" />
                          {conversation.isArchived ? "Unarchive" : "Archive"}
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.href);
                            setOpenMenuId(null);
                          }}
                        >
                          <Share className="w-4 h-4 mr-2" /> Share
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-sm text-[#FF6F61] hover:bg-[#FFE7E5] w-full text-left rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

// Main Sidebar Component
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
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("chat");

  useEffect(() => {
    if (!isSidebarVisible && isConversationOpen) {
      setIsConversationOpen(false);
    }
  }, [isSidebarVisible, isConversationOpen]);

  const enhancedStartNewChat = () => {
    if (!location.pathname.includes('/notes')) {
      navigate('/notes');
    }
    startNewChat();
  };

  const handleHomePage = () => {
    navigate('/chat');
  };

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
    setActiveNav(path);
    if (isMobile) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
  };

  const toggleConversation = () => {
    setIsConversationOpen(!isConversationOpen);
  };

  const navigationItems = [
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "search", icon: Search, label: "Search" },
    { id: "tasks", icon: CheckSquare, label: "Tasks" },
    { id: "mood", icon: Smile, label: "Mood" },
  ];

  const handleNavClick = (id) => {
    if (id === "chat") {
      enhancedStartNewChat();
    } else {
      handleNavigate(id);
    }
  };

  return (
    <>
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] md:hidden"
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
            className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 p-2.5 bg-white/80 backdrop-blur-sm rounded-r-xl border border-[#FFE7E5] border-l-0 shadow-lg hover:bg-white transition-all"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="w-4 h-4 text-[#FF6F61]" />
          </button>
        </Tooltip>
      )}
      
      <div
        className={`
          fixed md:relative bg-white/70 backdrop-blur-xl border-r border-[#FFE7E5] flex flex-col h-screen
          transition-all duration-300 ease-in-out z-[60]
          ${isMobile ? "w-72" : isSidebarVisible ? "w-[280px]" : "w-0 overflow-hidden"}
          ${isMobile && !showSidebarOverlay ? "-translate-x-full" : "translate-x-0"}
          shadow-xl
          overflow-hidden
        `}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#FFE7E5]/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6F61] to-[#FF8A7D] rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FF6F61] rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#2B3440]">Athena AI</h1>
              <p className="text-xs text-gray-500">Wellness Assistant</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="ml-auto p-1.5 hover:bg-[#FFE7E5] rounded-lg transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronsRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-b border-[#FFE7E5]/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#2B3440]">{user?.displayName || "Welcome"}</h3>
              <p className="text-xs text-gray-500">Premium Member</p>
            </div>
            <Tooltip text="Conversation History" position="top">
              <button
                onClick={toggleConversation}
                className="p-2 hover:bg-[#FFE7E5] rounded-lg transition-colors"
              >
                <ClockIcon className="w-4 h-4 text-gray-500" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-4 py-6">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeNav === item.id 
                    ? 'bg-[#FF6F61]/10 text-[#FF6F61]' 
                    : 'text-[#2B3440] hover:bg-[#FFE7E5]'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${activeNav === item.id ? 'text-[#FF6F61]' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {activeNav === item.id && (
                  <div className="ml-auto w-1 h-6 bg-[#FF6F61] rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 px-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              <button 
                onClick={enhancedStartNewChat}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#2B3440] hover:bg-[#FFE7E5] rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Journal Entry
              </button>
              <button 
                onClick={() => handleNavigate('calendar')}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#2B3440] hover:bg-[#FFE7E5] rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Schedule Session
              </button>
              <button 
                onClick={() => handleNavigate('bookmarks')}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#2B3440] hover:bg-[#FFE7E5] rounded-lg transition-colors"
              >
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
          <div className="px-4 py-4 border-t border-[#FFE7E5]/50">
          <div className="mt-4 pt-4 border-t border-[#FFE7E5]/50">
            <button
              onClick={() => handleNavigate('profile')}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#FFE7E5] rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[#2B3440]">My Profile</p>
                <p className="text-xs text-gray-500">View & edit profile</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;