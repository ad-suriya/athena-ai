import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Settings,
  Upload,
  Mic,
  Image as ImageIcon,
  X,
  StopCircle,
  Copy,
  Check,
  Edit,
  ChevronDown,
  Layers,
  Zap,
  PanelLeft,
  Paperclip,
  Trash,
  MoreVertical,
  Send,
  MessageSquare,
  Brain,
  Atom,
  Volume2,
  Pencil,
  GraduationCap,
  Code,
  Coffee,
  Lightbulb,
  FileText,
  Globe,
  Search,
  BookOpen,
} from 'lucide-react';
import './chat.css';
import VoiceRecordingAnimation from '../../components/VoiceRecordingAnimation.jsx';
import SettingsPage from '../settings/settings';
import ProfilePage from '../profile/profile';
import logo from '../../assets/logo-07.png';
import FileUpload from '../../components/FileUpload';
import MessageEditor from '../../components/MessageEditor';
import EnhancedControlButton from '../../components/EnhancedControlButton';
import ConversationSearch from '../../components/ConversationSearch';
import ConversationItem from '../../components/ConversationItem';
import CopyButton from '../../components/CopyButton';
import ModelDropdown from '../../components/ModelDropdown.jsx';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SideBar.jsx';
import ReadAloudButton from '../../components/ReadAloudButton.jsx';
import ToggleButtons from '../../components/ToggleButtons';
import CopyButton1 from '../../components/CopyButton1.jsx';
import ReportIssueModal from '../../components/ReportIssueModal';
import NotificationAppProfile from '../../components/NotificationAppProfile;.jsx';
import {
  auth,
  db,
  createNewConversation,
  addMessageToConversation,
  getUserConversations,
  getConversationMessages,
} from '../../firebase.js';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import FileCategoryPanel from '../../components/FileCategoryPanel';
import { File } from 'lucide-react';
import UpcomingEvents from '../Calendar/UpcomingEvents.jsx';

// Tooltip Component
const Tooltip = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap pointer-events-none`}
        >
          {text}
          <div
            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2'
                : position === 'bottom'
                ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2'
                : position === 'left'
                ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2'
                : 'right-full top-1/2 -translate-y-1/2 translate-x-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

// AppLogo Component
const AppLogo = ({ size = 45 }) => (
  <img src={logo} alt="Yudle Logo" width={size} height={size} />
);

// SmartActionButton Component
const SmartActionButton = ({ icon, label, active, onClick, isSearch = false }) => {
  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium";

  const getButtonClasses = () => {
    if (isSearch) {
      return `${baseClasses} ${
        active 
          ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-inner shadow-[0_0_8px_rgba(59,130,246,0.5)]'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent hover:shadow-[0_0_4px_rgba(0,0,0,0.1)]'
      }`;
    } else if (label === 'Deep Research') {
      return `${baseClasses} ${
        active 
          ? 'bg-violet-100 text-violet-700 border border-violet-200 shadow-inner shadow-[0_0_8px_rgba(139,92,246,0.5)]'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent hover:shadow-[0_0_4px_rgba(0,0,0,0.1)]'
      }`;
    } else {
      return `${baseClasses} ${
        active 
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-inner shadow-[0_0_8px_rgba(234,179,8,0.5)]'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent hover:shadow-[0_0_4px_rgba(0,0,0,0.1)]'
      }`;
    }
  };

  const getIconClasses = () => {
    if (isSearch) {
      return `w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-600'}`;
    } else if (label === 'Deep Research') {
      return `w-4 h-4 ${active ? 'text-violet-600' : 'text-gray-600'}`;
    } else {
      return `w-4 h-4 ${active ? 'text-yellow-600' : 'text-gray-600'}`;
    }
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClasses()}
    >
      {React.cloneElement(icon, {
        className: getIconClasses()
      })}
      <span>{label}</span>
    </button>
  );
};

const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

const fetchLinkPreview = async (url) => {
  try {
    const apiKey = 'a00c0acc8d71a95ca890ebf7c659d05f';
    const response = await fetch(
      `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to fetch link preview');
    }
    return {
      title: data.title || 'No Title',
      description: data.description || 'No description available',
      image: data.image || '',
      url: data.url || url,
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return { title: 'Error Loading Preview', description: 'Could not load preview', image: '', url };
  }
};

const formatMessageContent = (content) => {
  if (!content) return content;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const codeContent = part.slice(3, -3).trim();
      const languageMatch = codeContent.match(/^(\w+)\n/);
      const language = languageMatch ? languageMatch[1] : '';
      const pureCode = language ? codeContent.slice(language.length).trim() : codeContent;

      return (
        <div key={`code-${index}`} className="code-block">
          <div className="code-header">
            <span className="code-language">{language || 'code'}</span>
            <CopyButton text={pureCode} />
          </div>
          <pre className="code-content">
            <code>{pureCode}</code>
          </pre>
        </div>
      );
    }

    const processedPart = part.split(/(\n)/g).map((line, lineIndex) => {
      if (line === '\n') return <br key={`br-${lineIndex}`} />;

      if (line.startsWith('### ') && line.length > 4) {
        const headingText = line.substring(4).trim().replace(/\*/g, '');
        return (
          <h3
            key={`h3-${lineIndex}`}
            className="text-lg font-bold mt-4 mb-2 text-gray-800"
          >
            {headingText}
          </h3>
        );
      }

      if (line.startsWith('## ') && line.length > 3) {
        const headingText = line.substring(3).trim();
        return (
          <h2
            key={`h2-${lineIndex}`}
            className="text-xl font-bold mt-5 mb-3 text-gray-900"
          >
            {headingText}
          </h2>
        );
      }

      if (line.startsWith('# ') && line.length > 2) {
        const headingText = line.substring(2).trim();
        return (
          <h1
            key={`h1-${lineIndex}`}
            className="text-2xl font-bold mt-6 mb-4 text-gray-900"
          >
            {headingText}
          </h1>
        );
      }

      const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={`text-${lineIndex}`}>
          {boldParts.map((boldPart, boldIndex) => {
            if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
              const boldText = boldPart.slice(2, -2);
              return <strong key={`bold-${boldIndex}`}>{boldText}</strong>;
            }
            return boldPart;
          })}
        </span>
      );
    });

    return <span key={`part-${index}`}>{processedPart}</span>;
  });
};

const Chat = ({ setIsAuthenticated }) => {
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const navigate = useNavigate();
  const [showFileCategoryPanel, setShowFileCategoryPanel] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [currentView, setCurrentView] = useState('chat');
  const [showDocsNotification, setShowDocsNotification] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
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
  const [userConversations, setUserConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeMode, setActiveMode] = useState('message');
  const [isRecognitionStarting, setIsRecognitionStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [linkPreviews, setLinkPreviews] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const sidebarRef = useRef(null);
  const attachmentPanelRef = useRef(null);
  const modelDropdownRef = useRef(null);

  const categories = [
    { id: 'write', label: 'Write', icon: Pencil },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'code', label: 'Code', icon: Code },
  ];

  const categoryOptions = {
    write: [
      'Create presentation scripts',
      'Help me identify my writing weaknesses',
      'Help me develop a unique voice for an audience',
      'Compare my writing style to famous authors',
    ],
    learn: [
      'Explain a complex concept',
      'Create study materials',
      'Practice questions and quizzes',
      'Summarize research papers',
    ],
    code: [
      'Debug my code',
      'API integration help',
      'Database design assistance',
      'Database design assistance',
    ],
  };

  const searchOptions = [
    { id: 'web', label: 'Web', icon: Search, description: 'Search across the entire Internet' },
    { id: 'academic', label: 'Academic', icon: BookOpen, description: 'Search academic papers' },
    { id: 'social', label: 'Social', icon: MessageSquare, description: 'Discussions and opinions' },
    { id: 'finance', label: 'Finance', icon: FileText, description: 'Search SEC filings' }
  ];

  // Check microphone permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if ('permissions' in navigator) {
          const status = await navigator.permissions.query({ name: 'microphone' });
          setPermissionState(status.state);
          
          status.onchange = () => {
            setPermissionState(status.state);
            if (status.state === 'denied') {
              stopRecording();
              setRecordingError('Microphone access was revoked');
            }
          };
        }
      } catch (error) {
        console.error('Permission check error:', error);
      }
    };
    
    checkPermissions();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (newIsMobile) {
        setIsSidebarVisible(false);
        setShowSidebarOverlay(false);
      } else {
        setIsSidebarVisible(true);
        setShowSidebarOverlay(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        showSidebarOverlay &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.mobile-menu-container') &&
        !event.target.closest('.menu-button')
      ) {
        setShowSidebarOverlay(false);
        setIsSidebarVisible(false);
      }
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
      if (showCategoryPanel && !event.target.closest('.category-panel') && !event.target.closest('.category-button')) {
        setShowCategoryPanel(false);
        setSelectedCategory(null);
      }
      if (
        activeUploadPanel &&
        attachmentPanelRef.current &&
        !attachmentPanelRef.current.contains(event.target) &&
        !event.target.closest('.attachment-button')
      ) {
        setActiveUploadPanel(null);
      }
      if (
        showModelDropdown &&
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target)
      ) {
        setShowModelDropdown(false);
      }
      if (
        activeAction &&
        activeAction.startsWith('options-') &&
        !event.target.closest('.more-options-dropdown')
      ) {
        setActiveAction(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, showSidebarOverlay, showMobileMenu, showCategoryPanel, activeUploadPanel, showModelDropdown, activeAction]);

  const setupAudioVisualization = async (stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;

      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateAudioLevel = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const level = Math.max(...dataArray);
        setAudioLevel(level);
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Audio visualization error:', error);
      setRecordingError('Failed to set up audio visualization.');
    }
  };

  const stopRecording = () => {
    clearTimeout(silenceTimerRef.current);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track:', e);
        }
      });
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.error('Error closing audio context:', e);
        }
      }
      audioContextRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsRecording(false);
    setIsRecognitionStarting(false);
    setAudioLevel(0);
  };

  const requestPermissionAgain = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setRecordingError(null);
        setPermissionState('granted');
      })
      .catch(error => {
        console.error('Permission request failed:', error);
        setRecordingError('Could not get microphone access');
        setPermissionState('denied');
      });
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (permissionState === 'denied') {
      setRecordingError('Microphone blocked - please enable in browser settings');
      return;
    }

    if (isRecognitionStarting) {
      return;
    }

    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setRecordingError('Speech recognition not supported in your browser');
      return;
    }

    setIsRecognitionStarting(true);
    setRecordingError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      await setupAudioVisualization(stream);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        clearTimeout(silenceTimerRef.current);
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');

        setInputValue(transcript);
        setRecordingError(null);

        silenceTimerRef.current = setTimeout(() => {
          setRecordingError('No speech detected. Try speaking louder or checking your microphone.');
          stopRecording();
        }, 5000);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setRecordingError(`Error: ${event.error}`);
        stopRecording();
      };

      recognitionRef.current.onend = () => {
        if (isRecording && !isRecognitionStarting) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
            setRecordingError('Failed to restart speech recognition.');
            stopRecording();
          }
        } else {
          recognitionRef.current = null;
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);
      setInputValue('');
    } catch (error) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        setRecordingError('Microphone access was denied. Please enable it in browser settings.');
        setPermissionState('denied');
      } else {
        setRecordingError('Failed to access microphone. Please check permissions.');
      }
      stopRecording();
    } finally {
      setIsRecognitionStarting(false);
    }
  };

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

  const toggleSidebar = () => {
    if (isMobile) {
      setShowSidebarOverlay((prev) => !prev);
      setIsSidebarVisible((prev) => !prev);
    } else {
      setIsSidebarVisible((prev) => !prev);
    }
  };

  const handleFilesUpload = (files) => {
    setUploadedFiles(files);
    setActiveUploadPanel(null);
  };

  const handleImagesUpload = (images) => {
    setUploadedImages(images);
    setActiveUploadPanel(null);
  };

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
  }, []);

  const loadConversation = async (conversationId) => {
    try {
      setMessages([]);
      setCurrentConversationId(null);

      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const convRef = doc(db, 'users', userId, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      if (!convSnap.exists()) throw new Error('Conversation not found');

      const messages = await getConversationMessages(userId, conversationId);

      setMessages(messages);
      setChatHistory(messages);
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

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setShowCategoryPanel(selectedCategory !== categoryId);
    setShowSearchOptions(false);
  };

  const handleCategoryOptionSelect = (option) => {
    const structuredPrompt = `
Hi Yudle! Could you ${option.toLowerCase()}? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to — like Google Drive, web search, etc. — if they'll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief, and conversational.

Please execute the task as soon as you can - an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
    `.trim();
    
    setInputValue(option);
    sendMessage(structuredPrompt);
    setShowCategoryPanel(false);
    setSelectedCategory(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRecording) {
      stopRecording();
    }

    let finalMessage = inputValue;

    if (activeAction === 'search') {
      finalMessage = `[Search] ${inputValue}`;
    } else if (activeAction === 'deepResearch') {
      finalMessage = `[Deep Research] ${inputValue}`;
    } else if (activeAction === 'think') {
      finalMessage = `[Critical Analysis] ${inputValue}`;
    }

    sendMessage(finalMessage, {
      isSearch: activeAction === 'search',
      isDeepResearch: activeAction === 'deepResearch',
      isCriticalAnalysis: activeAction === 'think',
    });
  };

  const handleEditMessage = (index) => setEditingMessageId(index);

  const handleCancelEdit = () => setEditingMessageId(null);

  const handleSaveEdit = async (index, newContent) => {
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

  const handleRateMessage = (index, isPositive) => {
    setMessageRatings((prev) => ({
      ...prev,
      [index]: isPositive ? 'positive' : 'negative',
    }));
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
      let endpoint = '/api/chat';
      let body = {
        message: userMessage.content,
        history: currentMessages.slice(0, userMessageIndex + 1),
        model: modelParam,
      };

      if (isSearch) {
        endpoint = '/api/search';
        body = {
          query: userMessage.content.replace('[Search]', '').trim(),
          model: modelParam,
        };
      } else if (isDeepResearch) {
        endpoint = '/api/research';
        body = {
          query: userMessage.content.replace('[Deep Research]', '').trim(),
          model: modelParam,
        };
      } else if (isCriticalAnalysis) {
        endpoint = '/api/analyze';
        body = {
          query: userMessage.content.replace('[Critical Analysis]', '').trim(),
          model: modelParam,
        };
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('No response content received from API');
      }

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

  const handleActionClick = (action) => {
    if (activeAction === action) {
      setActiveAction(null);
    } else {
      setActiveAction(action);
      setShowSearchOptions(false);
    }
  };

  const handleReportIssue = (index) => {
    setSelectedMessageIndex(index);
    setIsReportModalOpen(true);
    setActiveAction(null);
  };

  const sendMessage = async (message, flags = {}) => {
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

    try {
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createNewConversation(userId, message);
        setCurrentConversationId(conversationId);
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
      let endpoint = '/api/chat';
      let body = {
        message,
        history: [...chatHistory, userMessage],
        model: modelParam,
      };

      if (userMessage.isSearch) {
        endpoint = '/api/search';
        body = {
          query: message.replace('[Search]', '').trim(),
          model: modelParam,
        };
      } else if (userMessage.isDeepResearch) {
        endpoint = '/api/research';
        body = {
          query: message.replace('[Deep Research]', '').trim(),
          model: modelParam,
        };
      } else if (userMessage.isCriticalAnalysis) {
        endpoint = '/api/analyze';
        body = {
          query: message.replace('[Critical Analysis]', '').trim(),
          model: modelParam,
        };
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('No response content received from API');
      }

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
    setCurrentView('chat');
    setActiveAction(null);
    setCurrentConversationId(null);
    setErrorMessage(null);
    if (isMobile) {
      setShowSidebarOverlay(false);
      setIsSidebarVisible(false);
    }
  };

  const dismissDocsNotification = () => {
    setShowDocsNotification(false);
  };

  const toggleUploadPanel = (panelType) => {
    setActiveUploadPanel(activeUploadPanel === panelType ? null : panelType);
  };

  const renderInputButton = () => {
    if (isRecording) {
      return (
        <Tooltip text="Stop recording">
          <button
            type="button"
            onClick={stopRecording}
            className="p-2 rounded-full text-red-500 hover:text-red-600 bg-red-50 transition-colors"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        </Tooltip>
      );
    }

    if (inputValue.trim()) {
      return (
        <Tooltip text="Send message">
          <button
            type="submit"
            className="p-2 rounded-full text-[#0E0E28] hover:text-[#0E0E28]/80 bg-[#0E0E28]/10 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </Tooltip>
      );
    }

    return (
      <Tooltip text={permissionState === 'denied' ? 
        "Microphone blocked - click to manage permissions" : 
        "Voice input"}>
        <button
          type="button"
          onClick={permissionState === 'denied' ? requestPermissionAgain : toggleRecording}
          className={`p-2 rounded-full transition-colors ${
            permissionState === 'denied' ? 
              'text-red-500 bg-red-50' :
              'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          {permissionState === 'denied' ? (
            <X className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </Tooltip>
    );
  };

  const exportToPDF = (messageContent) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setProperties({
        title: 'Chat Message',
        author: auth.currentUser?.displayName || 'Anonymous',
        creator: 'Yudle Chat',
      });

      const lines = doc.splitTextToSize(messageContent, 180);
      doc.text(lines, 10, 10);

      doc.save('chat_message.pdf');
    };
    document.body.appendChild(script);
  };
 return (
    <div className="h-screen flex overflow-hidden bg-[#F5D9D1]/30">
      <Sidebar isSidebarVisible={isSidebarVisible} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between h-[65px] border-b border-[#E65C52]/10">
          <div className="flex items-center gap-2">
            {!isSidebarVisible && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-[#F5D9D1] transition-colors"
              >
                <PanelLeft className="w-5 h-5 text-[#E65C52]" />
              </button>
            )}
            {messages.length === 0 && (
              <>
                <AppLogo size={45} />
                <div className="font-semibold text-lg text-[#E14C42]">Athena AI</div>
              </>
            )}
          </div>
          {messages.length === 0 && <NotificationAppProfile isMobile={isMobile} />}
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-4xl">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <h1 className="text-2xl md:text-4xl font-semibold mb-2 text-[#E14C42]">
                    Hi there!
                  </h1>
                  <p className="text-gray-600 text-lg md:text-xl mb-8">
                    How can I assist you today?
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-2xl mx-auto bg-white border-2 border-[#E65C52]/20 rounded-xl px-4 py-4 shadow-lg hover:shadow-xl hover:shadow-[#E65C52]/10 transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base min-h-[40px] py-2"
                        disabled={isLoading}
                        autoFocus
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative" ref={attachmentPanelRef}>
                            <Tooltip text="Attach files">
                              <button
                                type="button"
                                className="p-2 rounded-lg text-[#E65C52] hover:bg-[#F5D9D1] transition-colors"
                                onClick={() => setActiveUploadPanel(activeUploadPanel ? null : 'attachment')}
                              >
                                <Paperclip className="w-5 h-5" />
                              </button>
                            </Tooltip>
                            {activeUploadPanel === 'attachment' && (
                              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border-2 border-[#E65C52]/20 p-2 z-10 w-48">
                                <div className="flex flex-col gap-1">
                                  <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F5D9D1] rounded cursor-pointer">
                                    <FileText className="w-4 h-4 text-[#E65C52]" />
                                    <span>Upload File</span>
                                    <input type="file" className="hidden" multiple />
                                  </label>
                                  <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F5D9D1] rounded cursor-pointer">
                                    <ImageIcon className="w-4 h-4 text-[#E65C52]" />
                                    <span>Upload Image</span>
                                    <input type="file" className="hidden" accept="image/*" multiple />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          <ToggleButtons />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative" ref={modelDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setShowModelDropdown(!showModelDropdown)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#E65C52] hover:bg-[#F5D9D1] rounded-lg transition-colors border border-[#E65C52]/20"
                            >
                              <span>{selectedModel}</span>
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            {showModelDropdown && (
                              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border-2 border-[#E65C52]/20 py-1 z-20 min-w-[120px]">
                                {['GPT', 'Minerva', 'Gemini'].map((model) => (
                                  <button
                                    key={model}
                                    type="button"
                                    onClick={() => {
                                      setSelectedModel(model);
                                      setShowModelDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F5D9D1] transition-colors ${
                                      selectedModel === model
                                        ? 'text-[#E65C52] bg-[#F5D9D1]/50 font-medium'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {model}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {renderInputButton()}
                        </div>
                      </div>
                    </div>
                  </form>

                  <div className="w-full max-w-2xl mt-6">
                    <div className="flex flex-wrap justify-center gap-2">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`
                              flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium border-2
                              ${selectedCategory === category.id 
                                ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white border-transparent shadow-lg shadow-[#E65C52]/30' 
                                : 'bg-white text-gray-700 border-[#E65C52]/20 hover:bg-[#F5D9D1] hover:border-[#E65C52]/40'
                              }
                            `}
                          >
                            <Icon />
                            <span>{category.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showCategoryPanel && selectedCategory && (
                      <div className="relative w-full mt-4">
                        <div className="absolute left-0 right-0 mx-auto border-2 border-[#E65C52]/20 rounded-xl shadow-xl z-10 overflow-hidden bg-white">
                          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#E65C52]/20 bg-gradient-to-r from-[#F5D9D1]/50 to-white">
                            <div className="flex items-center gap-2">
                              {React.createElement(categories.find((c) => c.id === selectedCategory)?.icon)}
                              <span className="font-medium text-[#E14C42]">
                                {categories.find((c) => c.id === selectedCategory)?.label}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setShowCategoryPanel(false);
                                setSelectedCategory(null);
                              }}
                              className="text-gray-400 hover:text-[#E65C52] hover:bg-[#F5D9D1] rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="py-2">
                            {categoryOptions[selectedCategory]?.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => handleCategoryOptionSelect(option)}
                                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-[#F5D9D1] transition-colors border-b border-[#E65C52]/10 last:border-b-0"
                              >
                                <span className="text-sm leading-relaxed">{option}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8 py-2 md:py-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-full md:max-w-4xl rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white p-3 md:p-5 shadow-lg'
                            : 'bg-white border-2 border-[#E65C52]/20 shadow-md p-3 md:p-5'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {message.role === 'assistant' && (
                          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[#E65C52]/10">
                            <Tooltip text="Copy">
                              <CopyButton text={message.content} />
                            </Tooltip>
                            <Tooltip text="Read Aloud">
                              <ReadAloudButton text={message.content} />
                            </Tooltip>
                            <Tooltip text="Like">
                              <button
                                className={`p-1.5 rounded-md transition-colors ${
                                  messageRatings[index] === 'positive'
                                    ? 'text-[#E65C52] bg-[#F5D9D1]'
                                    : 'text-gray-400 hover:bg-[#F5D9D1] hover:text-[#E65C52]'
                                }`}
                                onClick={() => handleRateMessage(index, true)}
                              >
                                👍
                              </button>
                            </Tooltip>
                            <Tooltip text="Dislike">
                              <button
                                className={`p-1.5 rounded-md transition-colors ${
                                  messageRatings[index] === 'negative'
                                    ? 'text-[#E65C52] bg-[#F5D9D1]'
                                    : 'text-gray-400 hover:bg-[#F5D9D1] hover:text-[#E65C52]'
                                }`}
                                onClick={() => handleRateMessage(index, false)}
                              >
                                👎
                              </button>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-full md:max-w-4xl p-3 md:p-5 rounded-2xl bg-white border-2 border-[#E65C52]/20">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#E65C52] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-[#E65C52] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-[#E65C52] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Input (when conversation exists) */}
          {messages.length > 0 && (
            <div className="sticky bottom-0 p-4 bg-transparent">
              <div className="max-w-4xl mx-auto">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border-2 border-[#E65C52]/20 rounded-xl px-4 py-4 shadow-lg hover:shadow-xl hover:shadow-[#E65C52]/10 transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base min-h-[40px] py-2"
                      disabled={isLoading}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 rounded-lg text-[#E65C52] hover:bg-[#F5D9D1] transition-colors"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <ToggleButtons />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#E65C52] hover:bg-[#F5D9D1] rounded-lg transition-colors border border-[#E65C52]/20"
                        >
                          <span>{selectedModel}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {renderInputButton()}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;