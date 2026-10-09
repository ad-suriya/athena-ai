import React, { useState, useRef, useEffect } from 'react';

import './Chat.css';
import SettingsPage from '../../pages/settings/Settings';
import ProfilePage from '../../pages/profile/Profile';
import { useLocation, useNavigate } from 'react-router-dom';
import ConversationPanel from './components/history/ConversationPanel.jsx';
import { auth } from '../../config/firebase.js';
import { searchOptions } from './data/ChatCategoriesData.js';
import { extractUrls, fetchLinkPreview, formatMessageContent, exportToPDF } from './utils/ChatUtils.jsx';
import { useVoiceRecording } from '../../hooks/useVoiceRecording.jsx';
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
    isLoading,
    errorMessage,
    setErrorMessage,
    linkPreviews,
    loadConversation,
    handleSaveEdit: handleSaveEditInternal,
    handleRegenerate,
    sendMessage,
    startNewChat,
    renameConversation,
    archiveConversation,
    deleteConversation,
    toggleFavorite,
    toggleArchive
  } = useChatManager(auth, selectedModel);

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

  // Hand-offs from other screens (Ask Athena, wellness tools, search). Each navigation
  // is handled once, by its location key, even when effects run twice in development.
  // Handlers are read through a ref so the effect only depends on the navigation.
  const location = useLocation();
  const handledLocation = useRef(null);
  const handoffActions = useRef(null);
  handoffActions.current = {
    openConversation: (id) => loadConversation(id),
    ask: (prompt) => {
      startNewChat();
      sendMessage(prompt, {}, setInputValue, setActiveAction, setShowCategoryPanel, setSelectedCategory);
    },
    showCategory: (category) => {
      setSelectedCategory(category);
      setShowCategoryPanel(true);
    },
  };
  useEffect(() => {
    const handoff = location.state;
    if (!handoff || handledLocation.current === location.key) return;
    handledLocation.current = location.key;
    const actions = handoffActions.current;
    if (handoff.conversationId) actions.openConversation(handoff.conversationId);
    else if (handoff.prompt) actions.ask(handoff.prompt);
    else if (handoff.category) actions.showCategory(handoff.category);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.state, location.pathname, navigate]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const currentTitle = userConversations.find((c) => c.id === currentConversationId)?.title;

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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
    onDelete,
    handleDeleteConversation
  } = createChatHandlers({
    isRecording,
    inputValue,
    activeAction,
    selectedCategory,
    activeUploadPanel,
    stopRecording,
    sendMessage,
    currentConversationId,
    setInputValue,
    setActiveAction,
    setShowCategoryPanel,
    setSelectedCategory,
    setUploadedFiles,
    setUploadedImages,
    setActiveUploadPanel,
    setShowSearchOptions,
    setEditingMessageId,
    setMessageRatings,
    setIsReportModalOpen,
    setSelectedMessageIndex,
    archiveConversation,
    deleteConversation,
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
    <div className="relative h-full flex overflow-hidden bg-[#FFFCFB]">
      <ConversationPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        userConversations={userConversations}
        currentConversationId={currentConversationId}
        loadConversation={loadConversation}
        deleteConversation={handleDeleteConversation}
        renameConversation={renameConversation}
        toggleFavorite={toggleFavorite}
        toggleArchive={toggleArchive}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatHeader
          historyOpen={historyOpen}
          onToggleHistory={() => setHistoryOpen(!historyOpen)}
          onNewChat={() => { setHistoryOpen(false); startNewChat(); }}
          title={currentTitle}
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