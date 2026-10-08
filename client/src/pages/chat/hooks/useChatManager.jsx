import { useState, useEffect } from 'react';
import { collection, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { 
  getConversationMessages, 
  createNewConversation, 
  addMessageToConversation, 
  getUserConversations
} from '../../../firebase.js';
import { 
  callChatAPI,
  extractUrls,
  fetchLinkPreview 
} from '../utils/ChatUtils.jsx';

export const useChatManager = (auth, selectedModel, isMobile, setShowSidebarOverlay, setIsSidebarVisible) => {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [userConversations, setUserConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [linkPreviews, setLinkPreviews] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const conversations = await getUserConversations(user.uid);
          setUserConversations(conversations);
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const loadConversation = async (conversationId) => {
    try {
      setMessages([]);
      setCurrentConversationId(null);

      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const convRef = doc(db, 'users', userId, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      if (!convSnap.exists()) throw new Error('Conversation not found');

      const msgs = await getConversationMessages(userId, conversationId);

      setMessages(msgs);
      setChatHistory(msgs);
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

      const updatedMessages = [...messages];
      updatedMessages[index].content = newContent;
      setMessages(updatedMessages);
      setEditingMessageId(null);

      const userId = auth.currentUser?.uid;
      if (!userId || !currentConversationId) {
        throw new Error('User not authenticated or conversation ID missing');
      }

      await updateDoc(doc(db, 'users', userId, 'conversations', currentConversationId), {
        messages: updatedMessages,
      });

      if (updatedMessages[index].role === 'user' && index + 1 < updatedMessages.length && updatedMessages[index + 1].role === 'assistant') {
        await handleRegenerate(index + 1);
      }
    } catch (error) {
      console.error('Error updating message in Firebase:', error);
      setErrorMessage(`Failed to update message: ${error.message}`);
    }
  };

  const handleRegenerate = async (index) => {
    const currentMessages = [...messages];
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

    const isSearch = userMessage.isSearch || false;
    const isDeepResearch = userMessage.isDeepResearch || false;
    const isCriticalAnalysis = userMessage.isCriticalAnalysis || false;

    setMessages((prevMessages) => {
      const updatedMessages = prevMessages
        .slice(0, index)
        .filter((msg) => msg.content !== 'Thinking...');
      updatedMessages.push({
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date().toISOString(),
        modelUsed: selectedModel,
        isSearch,
        isDeepResearch,
        isCriticalAnalysis,
      });
      return updatedMessages;
    });
    setIsLoading(false);
    setErrorMessage(null);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const modelParam = selectedModel.toLowerCase();
      const history = currentMessages.slice(0, userMessageIndex + 1);
      const flags = { isSearch, isDeepResearch, isCriticalAnalysis };
      const data = await callChatAPI(userMessage.content, history, flags, modelParam);

      const newAssistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel,
        isSearch,
        isDeepResearch,
        isCriticalAnalysis,
      };

      const urls = extractUrls(data.response);
      const previews = {};
      for (const url of urls) {
        previews[url] = await fetchLinkPreview(url);
      }
      setLinkPreviews((prev) => ({ ...prev, ...previews }));

      setMessages((prevMessages) => [...prevMessages.slice(0, -1), newAssistantMessage]);
      setChatHistory((prevHistory) => [...prevHistory.slice(0, -1), newAssistantMessage]);

      if (currentConversationId) {
        const updatedMessages = [...currentMessages.slice(0, index), newAssistantMessage];
        await updateDoc(doc(db, 'users', userId, 'conversations', currentConversationId), {
          messages: updatedMessages,
        });
      }
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

    const userId = auth.currentUser?.uid;
    if (!userId) {
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

    try {
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createNewConversation(userId, message);
        setCurrentConversationId(conversationId);
        
        getUserConversations(userId).then(conversations => {
          setUserConversations(conversations);
        }).catch(console.error);

        if (isMobile) {
          setShowSidebarOverlay(false);
          setIsSidebarVisible(false);
        }
      } else {
        await addMessageToConversation(userId, conversationId, message, 'user');
      }

      const urls = extractUrls(message);
      const previews = {};
      for (const url of urls) {
        previews[url] = await fetchLinkPreview(url);
      }
      setLinkPreviews((prev) => ({ ...prev, ...previews }));

      const modelParam = selectedModel.toLowerCase();
      const history = [...chatHistory, userMessage];
      const apiFlags = {
        isSearch: userMessage.isSearch,
        isDeepResearch: userMessage.isDeepResearch,
        isCriticalAnalysis: userMessage.isCriticalAnalysis,
      };
      const data = await callChatAPI(message, history, apiFlags, modelParam);

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel,
        isSearch: userMessage.isSearch,
        isDeepResearch: userMessage.isDeepResearch,
        isCriticalAnalysis: userMessage.isCriticalAnalysis,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setChatHistory((prev) => [...prev, assistantMessage]);
      await addMessageToConversation(userId, conversationId, data.response, 'assistant');
    } catch (error) {
      console.error('API Error:', error);
      setErrorMessage(`Failed to send message: ${error.message}`);
    } finally {
      setIsLoading(false);
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
    startNewChat
  };
};
