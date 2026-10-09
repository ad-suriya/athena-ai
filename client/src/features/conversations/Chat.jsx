import React, { useState, useRef, useEffect } from 'react';

import './Chat.css';
import { useLocation, useNavigate } from 'react-router-dom';
import ConversationPanel from './components/history/ConversationPanel.jsx';
import { auth } from '../../config/firebase.js';
import { extractUrls, fetchLinkPreview, formatMessageContent, exportToPDF } from './utils/ChatUtils.jsx';
import { useVoiceRecording } from '../../hooks/useVoiceRecording.jsx';
import { useChatManager } from './hooks/useChatManager.jsx';
import { ChatMainView } from './components/ChatMainView.jsx';
import { ChatHeader } from './components/ChatHeader.jsx';
import { createChatHandlers } from './hooks/useChatHandlers.jsx';
import { ChatModals } from './components/ChatModals.jsx';

const Chat = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showFileCategoryPanel, setShowFileCategoryPanel] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showDocsNotification, setShowDocsNotification] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState(null);
  const [chatCopied, setChatCopied] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('GPT');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    rateMessage,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const {
    handleFilesUpload,
    removeAttachment,
    toggleSearch,
    handleCategoryClick,
    handleCategoryOptionSelect,
    handleSubmit,
    handleEditMessage,
    handleCancelEdit,
    handleSaveEdit,
    handleRateMessage,
    handleReportIssue,
    onArchive,
    onDelete,
    handleDeleteConversation
  } = createChatHandlers({
    isRecording,
    inputValue,
    activeAction,
    selectedCategory,
    stopRecording,
    sendMessage,
    currentConversationId,
    setInputValue,
    setActiveAction,
    setShowCategoryPanel,
    setSelectedCategory,
    attachments,
    setAttachments,
    setAttachmentError,
    setEditingMessageId,
    rateMessage,
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
    handleFilesUpload,
    attachments,
    removeAttachment,
    attachmentError,
    searchOn: activeAction === 'search',
    toggleSearch,
    setActiveAction,
    isRecording,
    stopRecording,
    permissionState,
    requestPermissionAgain,
    toggleRecording,
    activeAction,
    currentConversationId,
    chatCopied,
    // Copies the conversation as plain text (only the owner can open a chat, so a link would not work for others).
    onCopyChat: async () => {
      const transcript = messages
        .map((m) => `${m.role === 'user' ? 'You' : 'Athena'}: ${m.content}`)
        .join('\n\n');
      try {
        await navigator.clipboard.writeText(transcript);
        setChatCopied(true);
        setTimeout(() => setChatCopied(false), 2000);
      } catch {
        setErrorMessage('Could not copy the conversation.');
      }
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
      </div>

      <ChatModals
        isReportModalOpen={isReportModalOpen}
        setIsReportModalOpen={setIsReportModalOpen}
        messages={messages}
        conversationId={currentConversationId}
        selectedMessageIndex={selectedMessageIndex}
        showFileCategoryPanel={showFileCategoryPanel}
        setShowFileCategoryPanel={setShowFileCategoryPanel}
        setInputValue={setInputValue}
      />
    </div>
  );
};

export default Chat;