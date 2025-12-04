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
    <div className="h-screen flex overflow-hidden bg-[#F8F8F7]">
      {isMobile && showSidebarOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
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
        {isMobile && (
          <div className="bg-[#F8F8F7] backdrop-blur-sm px-4 py-2 flex items-center justify-between h-[65px] sticky top-0 z-30">
            {!showSidebarOverlay && !isSidebarVisible && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded spotlight-button hover:bg-gray-200 transition-colors menu-button shadow-[0_0_4px_rgba(0,0,0,0.1)]"
              >
                <PanelLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            {currentConversationId === null && (
              <div className="relative z-[60]">
                <NotificationAppProfile
                  user={auth.currentUser}
                  isMobile={isMobile}
                  setShowSidebarOverlay={setShowSidebarOverlay}
                  setIsSidebarVisible={setIsSidebarVisible}
                />
              </div>
            )}
          </div>
        )}

        {!isMobile && (
          <div className="bg-[#F8F8F7] backdrop-blur-sm px-4 py-2 flex items-center justify-between h-[65px]">
            <div className="flex items-center gap-2">
              {!isSidebarVisible && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors menu-button shadow-[0_0_4px_rgba(0,0,0,0.1)]"
                >
                  <PanelLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {currentConversationId === null && (
                <>
                  <AppLogo size={45} />
                  <div className="font-semibold text-lg">Athena AI</div>
                </>
              )}
            </div>
            {currentConversationId === null && (
              <div className="flex items-center gap-2">
                <NotificationAppProfile
                  user={auth.currentUser}
                  isMobile={isMobile}
                  setShowSidebarOverlay={setShowSidebarOverlay}
                  setIsSidebarVisible={setIsSidebarVisible}
                />
              </div>
            )}
          </div>
        )}

        {currentView === 'settings' ? (
          <SettingsPage onBack={() => setCurrentView('chat')} />
        ) : currentView === 'profile' ? (
          <ProfilePage onBack={() => setCurrentView('chat')} />
        ) : (
          <div className="flex flex-col h-full overflow-hidden bg-[#F8F8F7]">
            <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col items-center bg-[#F8F8F7]">
              <div className="w-full max-w-4xl">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <h1 className="text-2xl md:text-4xl font-semibold mb-2">
                      Hi, {auth.currentUser?.displayName?.split(' ')[0] || 'there'}!
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl mb-8">
                      How can I assist you today?
                    </p>

                    <form
                      onSubmit={handleSubmit}
                      className="w-full max-w-2xl mx-auto bg-white border border-gray-300 rounded-xl px-4 py-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask anything"
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
                                  className={`p-2 rounded spotlight-button hover:bg-gray-100 transition-colors attachment-button ${
                                    activeUploadPanel === 'attachment'
                                      ? 'text-[#0E0E28] bg-[#0E0E28]/10 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                      : 'text-gray-500 shadow-[0_0_4px_rgba(0,0,0,0.1)]'
                                  }`}
                                  onClick={() => toggleUploadPanel('attachment')}
                                >
                                  <Paperclip className="w-5 h-5" />
                                </button>
                              </Tooltip>
                              {activeUploadPanel === 'attachment' && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 z-10 w-48 border border-gray-200">
                                  <div className="flex flex-col gap-1">
                                    <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] rounded cursor-pointer">
                                      <FileText className="w-4 h-4" />
                                      <span>Upload File</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                          handleFilesUpload(e.target.files);
                                          setActiveUploadPanel(null);
                                        }}
                                        multiple
                                      />
                                    </label>
                                    <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] rounded cursor-pointer">
                                      <ImageIcon className="w-4 h-4" />
                                      <span>Upload Image</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                          handleImagesUpload(e.target.files);
                                          setActiveUploadPanel(null);
                                        }}
                                        multiple
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>

                            <ToggleButtons onModeChange={setActiveMode} />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative" ref={modelDropdownRef}>
                              <Tooltip text="Search options">
                                <button
                                  type="button"
                                  onClick={() => setShowSearchOptions(!showSearchOptions)}
                                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                  <Globe className="w-5 h-5" />
                                </button>
                              </Tooltip>

                              {showSearchOptions && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                                  <div className="p-3 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-900">Search options</h3>
                                  </div>
                                  <div className="p-2">
                                    {searchOptions.map((option) => {
                                      const Icon = option.icon;
                                      return (
                                        <button
                                          key={option.id}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md flex items-start gap-3"
                                          onClick={() => {
                                            setActiveAction('search');
                                            setInputValue(`[${option.label}] `);
                                            setShowSearchOptions(false);
                                            inputRef.current.focus();
                                          }}
                                        >
                                          <div className="p-1.5 rounded-md bg-gray-100 text-gray-600">
                                            <Icon className="w-4 h-4" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">{option.label}</div>
                                            <div className="text-xs text-gray-500">{option.description}</div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="relative" ref={modelDropdownRef}>
                              <button
                                type="button"
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)]"
                              >
                                <span>{selectedModel}</span>
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              {showModelDropdown && (
                                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200 min-w-[120px]">
                                  {['GPT', 'Minerva', 'Gemini'].map((model) => (
                                    <button
                                      key={model}
                                      type="button"
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setShowModelDropdown(false);
                                      }}
                                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)] ${
                                        selectedModel === model
                                          ? 'text-blue-600 bg-blue-50'
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
                        {/* <SmartActionButton
                          icon={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                          }
                          label="Search"
                          active={activeAction === 'search'}
                          onClick={() => handleActionClick('search')}
                          isSearch={true}
                        />
                        <SmartActionButton
                          icon={<Layers className="w-4 h-4" />}
                          label="Deep Research"
                          active={activeAction === 'deepResearch'}
                          onClick={() => handleActionClick('deepResearch')}
                        />
                        <SmartActionButton
                          icon={<Zap className="w-4 h-4" />}
                          label="Think"
                          active={activeAction === 'think'}
                          onClick={() => handleActionClick('think')}
                        /> */}
                        {categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium
                                ${selectedCategory === category.id 
                                  ? 'bg-gray-900 text-white shadow-[0_0_8px_rgba(0,0,0,0.3)]' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)]'
                                }
                              `}
                            >
                              <Icon className={`w-4 h-4 ${selectedCategory === category.id ? 'text-white' : 'text-gray-600'}`} />
                              <span>{category.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showCategoryPanel && selectedCategory && (
                        <div className="relative w-full mt-2">
                          <div className="absolute left-0 right-0 mx-auto border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden bg-white" style={{ width: 'calc(100% - 2rem)' }}>
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-gray-50">
                              <div className="flex items-center gap-2">
                                {React.createElement(categories.find((c) => c.id === selectedCategory)?.icon, { className: 'w-4 h-4 text-gray-600' })}
                                <span className="font-medium text-gray-900">
                                  {categories.find((c) => c.id === selectedCategory)?.label}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setShowCategoryPanel(false);
                                  setSelectedCategory(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="py-2">
                              {categoryOptions[selectedCategory]?.map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleCategoryOptionSelect(option)}
                                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] transition-colors border-b border-gray-300 last:border-b-0"
                                >
                                  <span className="text-sm leading-relaxed">{option}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="w-full mt-6">
                        <UpcomingEvents userId={auth.currentUser?.uid} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-8 py-2 md:py-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex animate-fade duration-300 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`message-container max-w-full md:max-w-4xl rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-[#1a1a1a] text-white p-3 md:p-5'
                              : 'bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm p-3 md:p-5 relative'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <div className="flex flex-col gap-3">
                              <div className="text-sm whitespace-pre-wrap">
                                {formatMessageContent(message.content)}
                              </div>
                              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-600">
                                <Tooltip text="Copy">
                                  <CopyButton1
                                    text={message.content}
                                    onCopy={() =>
                                      console.log('Copy clicked for user message index:', index)
                                    }
                                  />
                                </Tooltip>
                                <Tooltip text="Edit">
                                  <button
                                    className={`p-1.5 rounded-md transition-colors ${
                                      editingMessageId === index
                                        ? 'text-gray-300 bg-gray-700'
                                        : 'text-gray-300 bg-gray-700'
                                    }`}
                                    onClick={() => {
                                      console.log('Edit clicked for user message index:', index);
                                      handleEditMessage(index);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                              </div>
                              {editingMessageId === index && (
                                <div className="mt-4">
                                  <MessageEditor
                                    content={message.content}
                                    onSave={(newContent) => handleSaveEdit(index, newContent)}
                                    onCancel={handleCancelEdit}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 pr-4">
                                  <div className="text-sm whitespace-pre-wrap">
                                    {formatMessageContent(message.content)}
                                  </div>
                                  {extractUrls(message.content).map((url) => {
                                    const preview = linkPreviews[url];
                                    return preview ? (
                                      <div
                                        key={url}
                                        className="mt-2 p-4 border rounded-lg bg-gray-50 max-w-full"
                                      >
                                        {preview.image && (
                                          <img
                                            src={preview.image}
                                            alt={preview.title}
                                            className="w-full h-32 sm:h-48 md:h-64 object-cover rounded-t-lg"
                                          />
                                        )}
                                        <div className="p-4">
                                          <h4 className="text-base font-bold link-preview-text">
                                            {preview.title}
                                          </h4>
                                          <p className="text-sm text-gray-600 link-preview-text">
                                            {preview.description}
                                          </p>
                                          <a
                                            href={preview.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 link-preview-text"
                                          >
                                            {preview.url}
                                          </a>
                                        </div>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                                <Tooltip text="Regenerate">
                                  <button
                                    className={`p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)] ${
                                      index === 0 || messages[index - 1].role !== 'user'
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                    onClick={() => {
                                      console.log('Regenerate clicked for index:', index);
                                      handleRegenerate(index);
                                    }}
                                    disabled={index === 0 || messages[index - 1].role !== 'user'}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                      <path d="M21 3v5h-5" />
                                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                      <path d="M8 16H3v5" />
                                    </svg>
                                  </button>
                                </Tooltip>
                                <Tooltip text="Copy">
                                  <CopyButton
                                    text={message.content}
                                    onCopy={() => console.log('Copy clicked for index:', index)}
                                  />
                                </Tooltip>
                                <Tooltip text="Read Aloud">
                                  <ReadAloudButton
                                    text={message.content}
                                    onStart={() =>
                                      console.log('Read Aloud started for index:', index)
                                    }
                                  />
                                </Tooltip>
                                <Tooltip text="Like">
                                  <button
                                    className={`p-1.5 rounded-md transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)] ${
                                      messageRatings[index] === 'positive'
                                        ? 'text-green-500 bg-green-50'
                                        : messageRatings[index] === 'negative'
                                        ? 'hidden'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                    onClick={() => {
                                      console.log('Like clicked for index:', index);
                                      handleRateMessage(index, true);
                                    }}
                                    disabled={editingMessageId === index}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                  </button>
                                </Tooltip>
                                <Tooltip text="Unlike">
                                  <button
                                    className={`p-1.5 rounded-md transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)] ${
                                      messageRatings[index] === 'negative'
                                        ? 'text-red-500 bg-red-50'
                                        : messageRatings[index] === 'positive'
                                        ? 'hidden'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                    onClick={() => {
                                      console.log('Unlike clicked for index:', index);
                                      handleRateMessage(index, false);
                                    }}
                                    disabled={editingMessageId === index}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                                    </svg>
                                  </button>
                                </Tooltip>
                                <Tooltip text="More options">
                                  <button
                                    className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)]"
                                    onClick={() => {
                                      setActiveAction(
                                        activeAction === `options-${index}` ? null : `options-${index}`
                                      );
                                    }}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                                {activeAction === `options-${index}` && (
                                  <div
                                    className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 more-options-dropdown"
                                    style={{ minWidth: '200px' }}
                                  >
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)] flex items-center"
                                      onClick={() => handleReportIssue(index)}
                                    >
                                      <span>Report Issue</span>
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)] flex items-center"
                                      onClick={() => {
                                        exportToPDF(message.content);
                                        setActiveAction(null);
                                      }}
                                    >
                                      <span>Export to PDF</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-fade duration-300">
                        <div className="max-w-full md:max-w-4xl p-3 md:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
                          <p className="text-sm">Thinking...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {messages.length > 0 && (
              <div className="sticky bottom-0 p-4 bg-transparent">
                <div className="max-w-4xl mx-auto">
                  {errorMessage && (
                    <div className="bg-red-50/90 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-700">{errorMessage}</span>
                      </div>
                      <button
                        className="text-red-400 hover:text-red-600 shadow-[0_0_4px_rgba(0,0,0,0.1)]"
                        onClick={() => setErrorMessage(null)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {recordingError && (
                    <div className="bg-red-50/90 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-700">{recordingError}</span>
                      </div>
                      <button
                        className="text-red-400 hover:text-red-600 shadow-[0_0_4px_rgba(0,0,0,0.1)]"
                        onClick={() => setRecordingError(null)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-300 rounded-xl px-4 py-4 shadow-sm relative"
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <Tooltip text="Share">
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            console.log('Share clicked');
                            navigator.clipboard.writeText(window.location.href);
                            alert('Chat link copied to clipboard!');
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                        </button>
                      </Tooltip>

                      <div className="relative">
                        <Tooltip text="More options">
                          <button
                            type="button"
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                            onClick={() => setActiveAction(activeAction === 'message-options' ? null : 'message-options')}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </Tooltip>

                        {activeAction === 'message-options' && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 w-40">
                            <button
                              type="button"
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              onClick={() => {
                                console.log('Archive clicked');
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
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="10" x2="15" y2="10"></line>
                                <line x1="9" y1="14" x2="15" y2="14"></line>
                              </svg>
                              <span>Archive</span>
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={() => {
                                console.log('Delete clicked');
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
                              }}
                            >
                              <Trash className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything"
                        className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base min-h-[40px] py-2"
                        disabled={isLoading}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative" ref={attachmentPanelRef}>
                            <button
                              type="button"
                              className={`p-2 rounded spotlight-button hover:bg-gray-100 transition-colors attachment-button ${
                                activeUploadPanel === 'attachment'
                                  ? 'text-[#0E0E28] bg-[#0E0E28]/10 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                  : 'text-gray-500 shadow-[0_0_4px_rgba(0,0,0,0.1)]'
                              }`}
                              onClick={() => toggleUploadPanel('attachment')}
                            >
                              <Paperclip className="w-5 h-5" />
                            </button>
                            {activeUploadPanel === 'attachment' && (
                              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 z-10 w-48 border border-gray-200">
                                <div className="flex flex-col gap-1">
                                  <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] rounded cursor-pointer">
                                    <FileText className="w-4 h-4" />
                                    <span>Upload File</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        handleFilesUpload(e.target.files);
                                        setActiveUploadPanel(null);
                                      }}
                                      multiple
                                    />
                                  </label>
                                  <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] rounded cursor-pointer">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>Upload Image</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => {
                                        handleImagesUpload(e.target.files);
                                        setActiveUploadPanel(null);
                                      }}
                                      multiple
                                    />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          <ToggleButtons onModeChange={setActiveMode} />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative" ref={modelDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setShowModelDropdown(!showModelDropdown)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)]"
                            >
                              <span>{selectedModel}</span>
                              <ChevronDown className="w-4 h-4" />
          </button>
          {showModelDropdown && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200 min-w-[120px]">
              {['GPT', 'Minerva', 'Gemini'].map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModelDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors shadow-[0_0_4px_rgba(0,0,0,0.1)] ${
                    selectedModel === model
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          )}
        </div>

          <Tooltip text="Browse files">
          </Tooltip>
                          {renderInputButton()}
                        </div>
                      </div>
                    </div>
                  </form>
                  {isRecording && (
                    <div className="mt-2 text-center">
                      <VoiceRecordingAnimation audioLevel={audioLevel} />
                      <p className="text-sm text-red-500 mt-1">Recording... Speak now</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isReportModalOpen && (
  <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
    <ReportIssueModal
      isOpen={isReportModalOpen}
      onClose={() => setIsReportModalOpen(false)}
      message={messages[selectedMessageIndex]?.content || ''}
    />
  </div>
)}

{/* Add this new panel component */}
{showFileCategoryPanel && (
  <div className="fixed inset-0 z-[100]">
    <FileCategoryPanel 
      onClose={() => setShowFileCategoryPanel(false)}
      onSelectFile={(file) => {
        setInputValue(`[File] ${file.name}`);
        setShowFileCategoryPanel(false);
      }}
    />
  </div>
)}
    </div>
    
  );
};

export default Chat;