import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const createChatHandlers = ({
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
}) => {
  return {
    toggleSidebar: () => {
      if (isMobile) {
        setShowSidebarOverlay((prev) => !prev);
        setIsSidebarVisible((prev) => !prev);
      } else {
        setIsSidebarVisible((prev) => !prev);
      }
    },
    handleFilesUpload: (files) => {
      setUploadedFiles(files);
      setActiveUploadPanel(null);
    },
    handleImagesUpload: (images) => {
      setUploadedImages(images);
      setActiveUploadPanel(null);
    },
    handleCategoryClick: (categoryId) => {
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setShowCategoryPanel(false);
      } else {
        setSelectedCategory(categoryId);
        setShowCategoryPanel(true);
      }
      setShowSearchOptions(false);
    },
    handleCategoryOptionSelect: (option) => {
      const structuredPrompt = `
Hi Yudle! Could you ${option.toLowerCase()}? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to — like Google Drive, web search, etc. — if they'll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief, and conversational.

Please execute the task as soon as you can - an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
      `.trim();
      
      sendMessage(structuredPrompt, {}, setInputValue, setActiveAction, setShowCategoryPanel, setSelectedCategory);
    },
    handleSubmit: (e) => {
      if (e) e.preventDefault();
      if (isRecording) stopRecording();

      let finalMessage = inputValue;
      if (activeAction === 'search') {
        finalMessage = `[Search] ${inputValue}`;
      } else if (activeAction === 'deepResearch') {
        finalMessage = `[Deep Research] ${inputValue}`;
      } else if (activeAction === 'think') {
        finalMessage = `[Critical Analysis] ${inputValue}`;
      }

      sendMessage(
        finalMessage, 
        {
          isSearch: activeAction === 'search',
          isDeepResearch: activeAction === 'deepResearch',
          isCriticalAnalysis: activeAction === 'think',
        },
        setInputValue, 
        setActiveAction, 
        setShowCategoryPanel, 
        setSelectedCategory
      );
    },
    handleEditMessage: (index) => setEditingMessageId(index),
    handleCancelEdit: () => setEditingMessageId(null),
    handleSaveEdit: (index, newContent) => {
      handleSaveEditInternal(index, newContent, setEditingMessageId);
    },
    handleRateMessage: (index, isPositive) => {
      setMessageRatings((prev) => ({
        ...prev,
        [index]: isPositive ? 'positive' : 'negative',
      }));
    },
    handleActionClick: (action) => {
      if (activeAction === action) {
        setActiveAction(null);
      } else {
        setActiveAction(action);
        setShowSearchOptions(false);
      }
    },
    handleReportIssue: (index) => {
      setSelectedMessageIndex(index);
      setIsReportModalOpen(true);
      setActiveAction(null);
    },
    toggleUploadPanel: (panelType) => {
      setActiveUploadPanel(activeUploadPanel === panelType ? null : panelType);
    },
    onArchive: () => {
      if (currentConversationId) {
        const userId = auth.currentUser?.uid;
        updateDoc(doc(db, 'users', userId, 'conversations', currentConversationId), {
          archived: true,
        }).then(() => {
          setUserConversations(prev => 
            prev.map(conv => 
              conv.id === currentConversationId ? {...conv, archived: true} : conv
            )
          );
          setActiveAction(null);
          startNewChat();
        });
      }
    },
    onDelete: () => {
      if (currentConversationId) {
        if (window.confirm('Are you sure you want to delete this conversation?')) {
          const userId = auth.currentUser?.uid;
          deleteDoc(doc(db, 'users', userId, 'conversations', currentConversationId))
            .then(() => {
              setUserConversations(prev => 
                prev.filter(conv => conv.id !== currentConversationId)
              );
              setActiveAction(null);
              startNewChat();
            });
        }
      }
    }
  };
};
