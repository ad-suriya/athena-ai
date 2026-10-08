import React, { useState, useRef, useEffect } from 'react';

import './chat.css';
import SettingsPage from '../settings/settings';
import ProfilePage from '../profile/profile';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SideBar.jsx';
import {
  auth,
  db,
  createNewConversation,
  addMessageToConversation,
  getUserConversations,
  getConversationMessages,
} from '../../firebase.js';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { searchOptions } from './data/ChatCategoriesData.js';
import { extractUrls, fetchLinkPreview, formatMessageContent, callChatAPI, exportToPDF } from './utils/ChatUtils.jsx';
import { useVoiceRecording } from './hooks/useVoiceRecording.jsx';
import { useChatManager } from './hooks/useChatManager.jsx';
import { ChatMainView } from './components/ChatMainView.jsx';
import { ChatHeader } from './components/ChatHeader.jsx';
import { createChatHandlers } from './hooks/useChatHandlers.jsx';
import { ChatModals } from './components/ChatModals.jsx';

const Chat = ({ setIsAuthenticated }) => {
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const navigate = useNavigate();
  const [showFileCategoryPanel, setShowFileCategoryPanel] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [currentView, setCurrentView] = useState('chat');
  const [showDocsNotification, setShowDocsNotification] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [activeUploadPanel, setActiveUploadPanel] = useState(null);
  const [messageRatings, setMessageRatings] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('GPT');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebarOverlay, setShowSidebarOverlay] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeMode, setActiveMode] = useState('message');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);

  const {
    messages,
    setMessages,
    chatHistory,
    currentConversationId,
    userConversations,
    setUserConversations,
    isLoading,
    errorMessage,
    setErrorMessage,
    linkPreviews,
    loadConversation,
    handleSaveEdit: handleSaveEditInternal,
    handleRegenerate,
    sendMessage,
    startNewChat
  } = useChatManager(auth, selectedModel, isMobile, setShowSidebarOverlay, setIsSidebarVisible);

  const {
    isRecording,
    recordingError,
    audioLevel,
    permissionState,
    stopRecording,
    requestPermissionAgain,
    toggleRecording,
    setRecordingError
  } = useVoiceRecording(setInputValue);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  const attachmentPanelRef = useRef(null);
  const modelDropdownRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentView === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentView, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const {
    toggleSidebar,
    handleFilesUpload,
    handleImagesUpload,
    handleCategoryClick,
    handleCategoryOptionSelect,
    handleSubmit,
    handleEditMessage,
    handleCancelEdit,
    handleSaveEdit,
    handleRateMessage,
    handleActionClick,
    handleReportIssue,
    toggleUploadPanel,
    onArchive,
    onDelete
  } = createChatHandlers({
    auth,
    db,
    isMobile,
    isRecording,
    inputValue,
    activeAction,
    selectedCategory,
    activeUploadPanel,
    stopRecording,
    sendMessage,
    startNewChat,
    currentConversationId,
    setInputValue,
    setActiveAction,
    setShowCategoryPanel,
    setSelectedCategory,
    setShowSidebarOverlay,
    setIsSidebarVisible,
    setUploadedFiles,
    setUploadedImages,
    setActiveUploadPanel,
    setShowSearchOptions,
    setEditingMessageId,
    setMessageRatings,
    setIsReportModalOpen,
    setSelectedMessageIndex,
    setUserConversations,
    handleSaveEditInternal
  });

  const dismissDocsNotification = () => {
    setShowDocsNotification(false);
  };

  const chatInputProps = {
    handleSubmit,
    inputRef,
    inputValue,
    setInputValue,
    isLoading,
    attachmentPanelRef,
    activeUploadPanel,
    toggleUploadPanel,
    handleFilesUpload,
    handleImagesUpload,
    setActiveUploadPanel,
    setActiveMode,
    modelDropdownRef,
    showSearchOptions,
    setShowSearchOptions,
    searchOptions,
    setActiveAction,
    isRecording,
    stopRecording,
    permissionState,
    requestPermissionAgain,
    toggleRecording,
    activeAction,
    currentConversationId,
    onShareClick: () => {
      console.log('Share clicked');
      navigator.clipboard.writeText(window.location.href);
      alert('Chat link copied to clipboard!');
    },
    onArchive,
    onDelete
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-b from-[#F5D9D1]/20 to-white">
      {isMobile && showSidebarOverlay && (
        <div
          className="fixed inset-0 bg-[#E65C52]/10 backdrop-blur-sm z-40"
          onClick={() => {
            setShowSidebarOverlay(false);
            setIsSidebarVisible(false);
          }}
        />
      )}

      <Sidebar
        ref={sidebarRef}
        isSidebarVisible={isSidebarVisible}
        isMobile={isMobile}
        showSidebarOverlay={showSidebarOverlay}
        toggleSidebar={toggleSidebar}
        userConversations={userConversations}
        currentConversationId={currentConversationId}
        loadConversation={loadConversation}
        startNewChat={startNewChat}
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={auth.currentUser}
        setShowSidebarOverlay={setShowSidebarOverlay}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatHeader
          isMobile={isMobile}
          showSidebarOverlay={showSidebarOverlay}
          isSidebarVisible={isSidebarVisible}
          toggleSidebar={toggleSidebar}
          currentConversationId={currentConversationId}
          user={auth.currentUser}
          setShowSidebarOverlay={setShowSidebarOverlay}
          setIsSidebarVisible={setIsSidebarVisible}
        />

        {currentView === 'settings' ? (
          <SettingsPage onBack={() => setCurrentView('chat')} />
        ) : currentView === 'profile' ? (
          <ProfilePage onBack={() => setCurrentView('chat')} />
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <ChatMainView
              messages={messages}
              user={auth.currentUser}
              chatInputProps={chatInputProps}
              categoryProps={{
                selectedCategory,
                showCategoryPanel,
                handleCategoryClick,
                handleCategoryOptionSelect,
                setShowCategoryPanel,
                setSelectedCategory
              }}
              messageListProps={{
                formatMessageContent,
                extractUrls,
                linkPreviews,
                editingMessageId,
                handleEditMessage,
                handleSaveEdit,
                handleCancelEdit,
                handleRegenerate,
                messageRatings,
                handleRateMessage,
                activeAction,
                setActiveAction,
                handleReportIssue,
                exportToPDF,
                isLoading,
                messagesEndRef
              }}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              recordingError={recordingError}
              setRecordingError={setRecordingError}
              isRecording={isRecording}
              audioLevel={audioLevel}
            />
          </div>
        )}
      </div>

      <ChatModals
        isReportModalOpen={isReportModalOpen}
        setIsReportModalOpen={setIsReportModalOpen}
        messages={messages}
        selectedMessageIndex={selectedMessageIndex}
        showFileCategoryPanel={showFileCategoryPanel}
        setShowFileCategoryPanel={setShowFileCategoryPanel}
        setInputValue={setInputValue}
      />
    </div>
  );
};

export default Chat;