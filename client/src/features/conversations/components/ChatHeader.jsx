import React from 'react';
import { PanelLeft } from 'lucide-react';
import NotificationAppProfile from './NotificationAppProfile.jsx';
import AppLogo from './AppLogo.jsx';

export const ChatHeader = ({
  isMobile,
  showSidebarOverlay,
  isSidebarVisible,
  toggleSidebar,
  currentConversationId,
  user,
  setShowSidebarOverlay,
  setIsSidebarVisible
}) => {
  return (
    <>
      {isMobile && (
        <div className="bg-gradient-to-r from-white to-[#F5D9D1]/30 backdrop-blur-sm px-4 py-2 flex items-center justify-between h-[65px] sticky top-0 z-30 border-b border-[#E65C52]/10">
          {!showSidebarOverlay && !isSidebarVisible && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-[#F5D9D1] transition-colors menu-button shadow-lg shadow-[#E65C52]/10"
            >
              <PanelLeft className="w-5 h-5 text-[#E65C52]" />
            </button>
          )}
          {currentConversationId === null && (
            <div className="relative z-[60]">
              <NotificationAppProfile
                user={user}
                isMobile={isMobile}
                setShowSidebarOverlay={setShowSidebarOverlay}
                setIsSidebarVisible={setIsSidebarVisible}
              />
            </div>
          )}
        </div>
      )}

      {!isMobile && (
        <div className="bg-[#F5D9D1]/20 px-4 py-2 flex items-center justify-between h-[65px] border-b border-[#E65C52]/10">
          <div className="flex items-center gap-2">
            {!isSidebarVisible && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-[#F5D9D1] transition-colors menu-button shadow-lg shadow-[#E65C52]/10"
              >
                <PanelLeft className="w-5 h-5 text-[#E65C52]" />
              </button>
            )}
            {currentConversationId === null && (
              <>
                <AppLogo size={45} />
                <div className="font-semibold text-lg bg-gradient-to-r from-[#E65C52] to-[#E14C42] bg-clip-text text-transparent">
                  Athena AI
                </div>
              </>
            )}
          </div>
          {currentConversationId === null && (
            <div className="flex items-center gap-2">
              <NotificationAppProfile
                user={user}
                isMobile={isMobile}
                setShowSidebarOverlay={setShowSidebarOverlay}
                setIsSidebarVisible={setIsSidebarVisible}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
