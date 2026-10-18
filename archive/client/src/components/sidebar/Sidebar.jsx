import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronsRight } from "lucide-react";
import ConversationPanel from "./ConversationPanel";
import SidebarNavigation from "./SidebarNavigation";
import SidebarUser from "./SidebarUser";
import Tooltip from "./Tooltip";
import { conversationShape } from "./sidebarPropTypes";

// App sidebar shared by Chat, Notes, Tasks and Mind Map: user header, navigation,
// quick actions, the conversation history panel, and Ctrl/⌘+K for a new journal entry.
// Conversation props are only supplied by Chat; other pages get the no-op defaults.
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

  // Close the history panel when the sidebar is collapsed.
  useEffect(() => {
    if (!isSidebarVisible && isConversationOpen) {
      setIsConversationOpen(false);
    }
  }, [isSidebarVisible, isConversationOpen]);

  // "New Journal Entry": go to Notes (if not already there) and reset the chat.
  const startNewJournalEntry = () => {
    if (!location.pathname.includes('/notes')) {
      navigate('/notes');
    }
    startNewChat();
  };

  const closeOnMobile = () => {
    if (isMobile) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        startNewJournalEntry();
        closeOnMobile();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  const handleNavClick = (path) => {
    navigate(`/${path}`);
    setActiveNav(path);
    closeOnMobile();
  };

  return (
    <>
      <ConversationPanel
        isOpen={isConversationOpen}
        onClose={() => setIsConversationOpen(false)}
        userConversations={userConversations}
        currentConversationId={currentConversationId}
        loadConversation={loadConversation}
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobile={isMobile}
        setShowSidebarOverlay={setShowSidebarOverlay}
        setIsSidebarVisible={setIsSidebarVisible}
        deleteConversation={deleteConversation}
        renameConversation={renameConversation}
        toggleFavorite={toggleFavorite}
        toggleArchive={toggleArchive}
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
          fixed md:relative bg-white/70 backdrop-blur-xl border-r border-[#FFE7E5] flex flex-col
          transition-all duration-300 ease-in-out z-[60]
          ${isMobile ? "w-72" : isSidebarVisible ? "w-[240px]" : "w-0 overflow-hidden"}
          ${isMobile && !showSidebarOverlay ? "-translate-x-full" : "translate-x-0"}
          shadow-xl
          h-screen max-h-screen
        `}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <SidebarUser
          user={user}
          isMobile={isMobile}
          onToggleHistory={() => setIsConversationOpen(!isConversationOpen)}
          onCollapse={toggleSidebar}
        />

        <SidebarNavigation
          activeNav={activeNav}
          onNavClick={handleNavClick}
          onNewJournalEntry={startNewJournalEntry}
        />
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isMobile: PropTypes.bool,
  showSidebarOverlay: PropTypes.bool,
  setShowSidebarOverlay: PropTypes.func,
  setIsSidebarVisible: PropTypes.func,
  isSidebarVisible: PropTypes.bool,
  toggleSidebar: PropTypes.func,
  startNewChat: PropTypes.func,
  currentView: PropTypes.string,
  setCurrentView: PropTypes.func,
  user: PropTypes.shape({ displayName: PropTypes.string }),
  userConversations: PropTypes.arrayOf(conversationShape),
  currentConversationId: PropTypes.string,
  loadConversation: PropTypes.func,
  deleteConversation: PropTypes.func,
  renameConversation: PropTypes.func,
  toggleFavorite: PropTypes.func,
  toggleArchive: PropTypes.func,
};

export default Sidebar;
