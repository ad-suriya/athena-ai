import { addAttachments } from '../utils/attachments';

export const createChatHandlers = ({
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
}) => {
  return {
    // Reads picked files for the next message (they are sent with it, then cleared).
    handleFilesUpload: async (files) => {
      const result = await addAttachments(attachments, files);
      setAttachments(result.attachments);
      setAttachmentError(result.error);
    },
    removeAttachment: (index) => {
      setAttachments(attachments.filter((_, i) => i !== index));
      setAttachmentError(null);
    },
    handleCategoryClick: (categoryId) => {
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setShowCategoryPanel(false);
      } else {
        setSelectedCategory(categoryId);
        setShowCategoryPanel(true);
      }
    },
    handleCategoryOptionSelect: (option) => {
      const structuredPrompt = `Could you help me ${option.toLowerCase()}? If you need more information, ask me one or two key questions first. Please keep it friendly, brief and conversational.`;

      sendMessage(structuredPrompt, {}, setInputValue, setActiveAction, setShowCategoryPanel, setSelectedCategory);
    },
    handleSubmit: (e) => {
      if (e) e.preventDefault();
      if (isRecording) stopRecording();

      sendMessage(
        inputValue,
        { search: activeAction === 'search', attachments },
        setInputValue,
        setActiveAction,
        setShowCategoryPanel,
        setSelectedCategory
      ).then((sent) => {
        if (sent) {
          setAttachments([]);
          setAttachmentError(null);
        }
      });
    },
    handleEditMessage: (index) => setEditingMessageId(index),
    handleCancelEdit: () => setEditingMessageId(null),
    handleSaveEdit: (index, newContent) => {
      handleSaveEditInternal(index, newContent, setEditingMessageId);
    },
    handleRateMessage: (index, isPositive) => rateMessage(index, isPositive ? 'up' : 'down'),
    // Web search on/off for the next message.
    toggleSearch: () => {
      setActiveAction(activeAction === 'search' ? null : 'search');
    },
    handleReportIssue: (index) => {
      setSelectedMessageIndex(index);
      setIsReportModalOpen(true);
      setActiveAction(null);
    },
    onArchive: () => {
      if (currentConversationId) {
        setActiveAction(null);
        archiveConversation(currentConversationId);
      }
    },
    onDelete: () => {
      if (currentConversationId) {
        if (window.confirm('Are you sure you want to delete this conversation?')) {
          setActiveAction(null);
          deleteConversation(currentConversationId);
        }
      }
    },
    // Sidebar conversation menu
    handleDeleteConversation: (conversationId) => {
      if (window.confirm('Are you sure you want to delete this conversation?')) {
        deleteConversation(conversationId);
      }
    }
  };
};
