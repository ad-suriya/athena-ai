import { useState, useEffect } from 'react';
import * as conversationService from '../../../services/conversationService';
import {
  extractUrls,
  fetchLinkPreview
} from '../utils/ChatUtils.jsx';

// API message → the shape the chat UI renders.
const toUiMessage = (m) => ({
  id: m.id,
  role: m.role,
  content: m.content,
  timestamp: m.createdAt,
  modelUsed: m.model,
  isSearch: m.metadata?.isSearch === true,
  isDeepResearch: m.metadata?.isDeepResearch === true,
  isCriticalAnalysis: m.metadata?.isCriticalAnalysis === true,
});

// API conversation → the fields the sidebar history panel reads.
const toUiConversation = (c) => ({
  ...c,
  preview: c.lastMessage || '',
  isArchived: c.archived === true,
  isFavorite: c.isFavorite === true,
});

export const useChatManager = (auth, selectedModel, isMobile, setShowSidebarOverlay, setIsSidebarVisible) => {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [userConversations, setUserConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [linkPreviews, setLinkPreviews] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        conversationService.getConversations()
          .then((conversations) => setUserConversations(conversations.map(toUiConversation)))
          .catch((error) => console.error('Error loading conversations:', error));
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const refreshConversations = () =>
    conversationService.getConversations()
      .then((conversations) => setUserConversations(conversations.map(toUiConversation)))
      .catch((error) => console.error('Error loading conversations:', error));

  // Re-reads messages from the server so the UI matches what was persisted.
  const syncMessages = async (conversationId) => {
    const msgs = (await conversationService.getMessages(conversationId)).map(toUiMessage);
    setMessages(msgs);
    setChatHistory(msgs);
    return msgs;
  };

  const loadPreviews = async (text) => {
    const previews = {};
    for (const url of extractUrls(text)) {
      previews[url] = await fetchLinkPreview(url);
    }
    setLinkPreviews((prev) => ({ ...prev, ...previews }));
  };

  const loadConversation = async (conversationId) => {
    try {
      setMessages([]);
      setCurrentConversationId(null);

      if (!auth.currentUser) throw new Error('User not authenticated');

      await syncMessages(conversationId);
      setCurrentConversationId(conversationId);
      if (isMobile) {
        setShowSidebarOverlay(false);
        setIsSidebarVisible(false);
      }
    } catch (error) {
      console.error('Load conversation failed:', error);
      setMessages([
        {
          role: 'system',
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleSaveEdit = async (index, newContent, setEditingMessageId) => {
    try {
      if (!newContent.trim()) {
        setErrorMessage('Edited message cannot be empty.');
        return;
      }

      const target = messages[index];
      if (!currentConversationId || !target?.id) {
        throw new Error('Conversation or message ID missing');
      }

      const updatedMessages = [...messages];
      updatedMessages[index] = { ...target, content: newContent };
      setMessages(updatedMessages);
      setEditingMessageId(null);

      await conversationService.editMessage(currentConversationId, target.id, newContent);

      if (target.role === 'user' && index + 1 < updatedMessages.length && updatedMessages[index + 1].role === 'assistant') {
        await handleRegenerate(index + 1, updatedMessages);
      }
    } catch (error) {
      console.error('Error updating message:', error);
      setErrorMessage(`Failed to update message: ${error.message}`);
    }
  };

  // baseMessages lets handleSaveEdit pass the just-edited list (state may not have updated yet).
  const handleRegenerate = async (index, baseMessages = messages) => {
    const currentMessages = [...baseMessages];
    const userMessageIndex = index - 1;

    if (userMessageIndex < 0 || userMessageIndex >= currentMessages.length) {
      console.warn('Invalid user message index:', userMessageIndex);
      setErrorMessage('Cannot regenerate: Invalid message index.');
      return;
    }

    const userMessage = currentMessages[userMessageIndex];
    if (!userMessage || userMessage.role !== 'user') {
      console.warn('No valid user message to regenerate at index:', userMessageIndex, 'Message:', userMessage);
      setErrorMessage('Cannot regenerate: No valid user message found.');
      return;
    }

    const target = currentMessages[index];
    if (!currentConversationId || !target?.id) {
      setErrorMessage('Cannot regenerate: message has not been saved.');
      return;
    }

    const isSearch = userMessage.isSearch || false;
    const isDeepResearch = userMessage.isDeepResearch || false;
    const isCriticalAnalysis = userMessage.isCriticalAnalysis || false;

    setMessages([
      ...currentMessages.slice(0, index).filter((msg) => msg.content !== 'Thinking...'),
      {
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date().toISOString(),
        modelUsed: selectedModel,
        isSearch,
        isDeepResearch,
        isCriticalAnalysis,
      },
    ]);
    setIsLoading(false);
    setErrorMessage(null);

    try {
      const saved = await conversationService.regenerateMessage(currentConversationId, target.id);
      const newAssistantMessage = toUiMessage(saved);

      await loadPreviews(newAssistantMessage.content);

      const updatedMessages = [...currentMessages.slice(0, index), newAssistantMessage];
      setMessages(updatedMessages);
      setChatHistory(updatedMessages);
      refreshConversations();
    } catch (error) {
      console.error('Regenerate error:', error);
      setErrorMessage(`Failed to regenerate message: ${error.message}`);
      setMessages(currentMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message, flags = {}, setInputValue, setActiveAction, setShowCategoryPanel, setSelectedCategory) => {
    if (!message.trim()) return;

    const { isSearch = false, isDeepResearch = false, isCriticalAnalysis = false } = flags;

    if (!auth.currentUser) {
      console.error('No user authenticated');
      setErrorMessage('Please sign in to send messages.');
      return;
    }

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      model: selectedModel,
      isSearch,
      isDeepResearch,
      isCriticalAnalysis,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');
    setActiveAction(null);
    setShowCategoryPanel(false);
    setSelectedCategory(null);

    let conversationId = currentConversationId;
    try {
      if (!conversationId) {
        conversationId = (await conversationService.createConversation()).id;
        setCurrentConversationId(conversationId);

        if (isMobile) {
          setShowSidebarOverlay(false);
          setIsSidebarVisible(false);
        }
      }

      await loadPreviews(message);

      // The backend saves the user message, calls Vertex AI, and saves the reply.
      const result = await conversationService.sendMessage(conversationId, message, {
        isSearch,
        isDeepResearch,
        isCriticalAnalysis,
      });
      const savedUser = toUiMessage(result.userMessage);
      const assistantMessage = toUiMessage(result.assistantMessage);

      // Replace the optimistic user message with the saved one (it carries the ID).
      setMessages((prev) => [...prev.slice(0, -1), savedUser, assistantMessage]);
      setChatHistory((prev) => [...prev, savedUser, assistantMessage]);
    } catch (error) {
      console.error('API Error:', error);
      setErrorMessage(`Failed to send message: ${error.message}`);
      // The user message may have been saved even if the AI failed; show the persisted state.
      if (conversationId) syncMessages(conversationId).catch(console.error);
    } finally {
      setIsLoading(false);
      if (conversationId) refreshConversations();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setChatHistory([]);
    setCurrentConversationId(null);
    setErrorMessage(null);
    if (isMobile) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
  };

  const renameConversation = async (conversationId, title) => {
    try {
      const updated = toUiConversation(await conversationService.renameConversation(conversationId, title.trim()));
      setUserConversations((prev) => prev.map((conv) => (conv.id === conversationId ? updated : conv)));
    } catch (error) {
      console.error('Rename conversation failed:', error);
      setErrorMessage(`Failed to rename conversation: ${error.message}`);
    }
  };

  const archiveConversation = async (conversationId) => {
    try {
      await conversationService.archiveConversation(conversationId);
      setUserConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, archived: true, isArchived: true } : conv))
      );
      if (conversationId === currentConversationId) startNewChat();
    } catch (error) {
      console.error('Archive conversation failed:', error);
      setErrorMessage(`Failed to archive conversation: ${error.message}`);
    }
  };

  // Sidebar menu: flips a flag on the server and updates the list.
  const updateConversationFlags = async (conversationId, changes, action) => {
    try {
      const updated = toUiConversation(await conversationService.updateConversation(conversationId, changes));
      setUserConversations((prev) => prev.map((conv) => (conv.id === conversationId ? updated : conv)));
      return updated;
    } catch (error) {
      console.error(`${action} conversation failed:`, error);
      setErrorMessage(`Failed to ${action.toLowerCase()} conversation: ${error.message}`);
      return null;
    }
  };

  const toggleFavorite = (conversationId) => {
    const conv = userConversations.find((c) => c.id === conversationId);
    return updateConversationFlags(conversationId, { isFavorite: !conv?.isFavorite }, 'Favorite');
  };

  // Archiving the open conversation also starts a new chat, as the input menu's Archive does.
  const toggleArchive = async (conversationId) => {
    const conv = userConversations.find((c) => c.id === conversationId);
    const updated = await updateConversationFlags(conversationId, { archived: !conv?.isArchived }, 'Archive');
    if (updated?.isArchived && conversationId === currentConversationId) startNewChat();
  };

  const deleteConversation = async (conversationId) => {
    try {
      await conversationService.deleteConversation(conversationId);
      setUserConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
      if (conversationId === currentConversationId) startNewChat();
    } catch (error) {
      console.error('Delete conversation failed:', error);
      setErrorMessage(`Failed to delete conversation: ${error.message}`);
    }
  };

  return {
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
    handleSaveEdit,
    handleRegenerate,
    sendMessage,
    startNewChat,
    renameConversation,
    archiveConversation,
    deleteConversation,
    toggleFavorite,
    toggleArchive
  };
};
