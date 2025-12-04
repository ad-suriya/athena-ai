import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Upload,
  Trash2,
  LinkIcon,
  Copy,
  Move,
  Type,
  Maximize,
  Lock,
  Edit3,
  Mic,
  Languages,
  Undo,
  RotateCcw,
  Clock,
  Bell,
  Users,
  Monitor,
  ChevronRight,
  Square,
  FileText
} from 'lucide-react';

// Voice recording animation component for the header
const VoiceRecordingHeaderIndicator = ({ audioLevel, transcript }) => {
  const bars = [15, 25, 35, 25, 15, 20, 30, 20, 15];
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center space-x-0.5 h-6 px-2 bg-[#F5D9D1] rounded-md border border-[#E65C52]/30">
        {bars.map((baseHeight, i) => (
          <div 
            key={i}
            className="w-0.5 bg-gradient-to-t from-[#E65C52] to-[#E14C42] rounded-full transition-all duration-100"
            style={{
              height: `${baseHeight * (audioLevel / 100)}px`,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-[#E14C42]">Recording</span>
      {transcript && (
        <span className="text-xs text-gray-500 truncate max-w-xs" title={transcript}>
          {transcript.length > 30 ? transcript.substring(0, 30) + '...' : transcript}
        </span>
      )}
    </div>
  );
};

// PDF Export Utility Functions
const PDFExportUtils = {
  // Function to export content as PDF
  exportToPDF: async (content, title = 'Note', metadata = {}) => {
    try {
      // Dynamically import jsPDF to avoid bundle bloat
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: title,
        subject: 'Exported from Notes App',
        author: metadata.author || 'Unknown',
        creator: 'Notes App',
        keywords: 'notes, export, document',
      });

      // Add header with theme colors
      doc.setFontSize(20);
      doc.setTextColor(230, 92, 82); // #E65C52
      doc.text(title, 105, 20, { align: 'center' });
      
      // Add metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      if (metadata.lastEdited) {
        doc.text(`Last edited: ${metadata.lastEdited}`, 105, 30, { align: 'center' });
      }
      if (metadata.author) {
        doc.text(`By: ${metadata.author}`, 105, 35, { align: 'center' });
      }

      // Format content
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      
      const margin = 20;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 50;
      
      // Split content into lines that fit the page width
      const lines = doc.splitTextToSize(content, 170);
      
      // Add content line by line
      lines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });

      // Add footer with theme color
      doc.setFontSize(10);
      doc.setTextColor(230, 92, 82);
      doc.text('Exported from Athena AI', 105, pageHeight - 10, { align: 'center' });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.pdf`;

      // Save the PDF
      doc.save(filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: error.message };
    }
  },

  // Function to extract text content from editor (assuming TipTap editor)
  extractEditorContent: (editor) => {
    if (!editor) return '';
    
    try {
      // Try to get text content from editor
      return editor.getText() || '';
    } catch (error) {
      console.warn('Could not extract editor content:', error);
      return '';
    }
  },

  // Function to get note metadata
  getNoteMetadata: (note) => {
    return {
      title: note?.title || 'Untitled Note',
      author: note?.author || 'Unknown',
      lastEdited: note?.lastEdited ? new Date(note.lastEdited).toLocaleString() : new Date().toLocaleString(),
      wordCount: note?.wordCount || 0
    };
  }
};

const DropdownMenu = ({ 
  isDarkMode, 
  editor, 
  onNavigateBack, 
  onSave, 
  note, 
  onDictationStateChange,
  onToggleFullWidth,
  onToggleSmallText,
  fullWidth,
  smallText,
  isLocked,
  onToggleLock,
  onExportComplete // New callback for export completion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      stopDictation();
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Update the transcript state for UI display
        setTranscript(interimTranscript);
        
        // Notify parent about transcript updates
        if (onDictationStateChange) {
          onDictationStateChange(true, audioLevel, interimTranscript);
        }
        
        if (finalTranscript !== '' && editor) {
          // Insert text at the current cursor position in TipTap editor
          editor.commands.insertContent(finalTranscript);
          setTranscript(''); // Clear interim transcript after insertion
          
          // Notify parent that transcript was cleared
          if (onDictationStateChange) {
            onDictationStateChange(true, audioLevel, '');
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access is not allowed. Please enable microphone permissions in your browser settings.');
        }
        stopDictation();
      };

      recognitionRef.current.onend = () => {
        if (isDictating) {
          // If still dictating, restart (happens automatically in some browsers)
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Could not restart recognition:', e);
            stopDictation();
          }
        }
      };
    }

    return () => {
      stopDictation();
    };
  }, [editor, isDictating]);

  // Initialize audio visualization
  const initAudioVisualization = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current || !isDictating) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Scale to 0-100 with smoothing
        const scaledLevel = Math.min(100, Math.max(0, average * 100 / 256));
        setAudioLevel(prev => {
          const newLevel = (prev * 0.7 + scaledLevel * 0.3); // Smooth transition
          
          // Notify parent component about updated audio level
          if (onDictationStateChange) {
            onDictationStateChange(true, newLevel, transcript);
          }
          
          return newLevel;
        });
        
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error initializing audio visualization:', error);
    }
  };

  const startDictation = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    
    if (!editor) {
      alert('Editor not ready. Please try again.');
      return;
    }
    
    try {
      // Initialize audio visualization
      await initAudioVisualization();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsDictating(true);
        setTranscript('Listening...');
        
        // Notify parent component about dictation state
        if (onDictationStateChange) {
          onDictationStateChange(true, 0, 'Listening...');
        }
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Error starting speech recognition. Please check microphone permissions.');
      stopDictation();
    }
  };

  const stopDictation = () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Clean up audio resources
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsDictating(false);
    setAudioLevel(0);
    setTranscript('');
    
    // Notify parent component about dictation state
    if (onDictationStateChange) {
      onDictationStateChange(false, 0, '');
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDictate = () => {
    if (isDictating) {
      stopDictation();
    } else {
      startDictation();
    }
    setIsOpen(false);
  };

  const handleUndo = () => {
    if (editor) {
      editor.chain().focus().undo().run();
    }
    setIsOpen(false);
  };

  const handleToggleLock = () => {
    onToggleLock(!isLocked);
    setIsOpen(false);
  };

  // Enhanced export handler
  const handleExport = async () => {
    setIsExporting(true);
    setIsOpen(false);
    
    try {
      // Extract content from editor
      const content = PDFExportUtils.extractEditorContent(editor);
      
      // Get note metadata
      const metadata = PDFExportUtils.getNoteMetadata(note);
      
      // Export to PDF
      const result = await PDFExportUtils.exportToPDF(content, metadata.title, metadata);
      
      if (result.success) {
        // Notify parent component about successful export
        if (onExportComplete) {
          onExportComplete({ 
            success: true, 
            filename: result.filename,
            note: metadata 
          });
        }
        
        // Show success message (you could replace this with a toast notification)
        console.log(`PDF exported successfully: ${result.filename}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export failed:', error);
      
      // Notify parent component about export failure
      if (onExportComplete) {
        onExportComplete({ 
          success: false, 
          error: error.message 
        });
      }
      
      // Show error message
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Other handler functions
  const handleCopyLink = () => { console.log('Copy link'); setIsOpen(false); };
  const handleDuplicate = () => { console.log('Duplicate note'); setIsOpen(false); };
  const handleMoveTo = () => { console.log('Move to'); setIsOpen(false); };
  const handleMoveToTrash = () => { console.log('Move to trash'); setIsOpen(false); };
  const handleCustomizePage = () => { console.log('Customize page'); setIsOpen(false); };
  const handleSuggestEdits = () => { console.log('Suggest edits'); setIsOpen(false); };
  const handleTranslate = () => { console.log('Translate'); setIsOpen(false); };
  const handleImport = () => { console.log('Import'); setIsOpen(false); };
  const handleTurnIntoWiki = () => { console.log('Turn into wiki'); setIsOpen(false); };
  const handleUpdatesAnalytics = () => { console.log('Updates & analytics'); setIsOpen(false); };
  const handleVersionHistory = () => { console.log('Version history'); setIsOpen(false); };
  const handleNotifyMe = () => { console.log('Notify me'); setIsOpen(false); };
  const handleConnections = () => { console.log('Connections'); setIsOpen(false); };
  const handleOpenInWindowsApp = () => { console.log('Open in Windows app'); setIsOpen(false); };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div className="flex items-center">
      <div 
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked 
            ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42]' 
            : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
        }`}
        onClick={onChange}
      >
        <div 
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-md ${
            checked ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`p-2 rounded-md transition-colors ${
          isDarkMode 
            ? 'text-gray-400 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
            : 'text-[#E65C52] hover:text-[#E14C42] hover:bg-[#F5D9D1]'
        }`}
        aria-label="More options"
      >
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 16 16" 
          fill="currentColor"
        >
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-1 w-64 rounded-lg shadow-xl border-2 border-[#E65C52]/20 py-2 z-50 ${
          isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-white to-[#F5D9D1]/20'
        }`}>
          <div className="max-h-96 overflow-y-auto">
            {/* Dictate button - moved to top for better visibility */}
            <button
              onClick={handleDictate}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDictating 
                  ? 'text-[#E14C42] bg-gradient-to-r from-[#F5D9D1] to-[#F5D9D1]/80 border-l-2 border-[#E65C52]' 
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                    : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              {isDictating ? (
                <Square size={16} className="mr-3 text-[#E14C42]" />
              ) : (
                <Mic size={16} className="mr-3 text-[#E65C52]" />
              )}
              {isDictating ? 'Stop Dictation' : 'Dictate'}
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Rest of the menu items */}
            <button
              onClick={handleCopyLink}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <div className="flex items-center">
                <LinkIcon size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Copy link
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'}`}>
                Ctrl+Alt+L
              </span>
            </button>

            {/* Duplicate */}
            <button
              onClick={handleDuplicate}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <div className="flex items-center">
                <Copy size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Duplicate
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'}`}>
                Ctrl+D
              </span>
            </button>

            {/* Move to */}
            <button
              onClick={handleMoveTo}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <div className="flex items-center">
                <Move size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Move to
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'}`}>
                Ctrl+↑+P
              </span>
            </button>

            {/* Move to Trash */}
            <button
              onClick={handleMoveToTrash}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <Trash2 size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Move to Trash
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Small text toggle */}
            <div className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="flex items-center">
                <Type size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Small text
              </div>
              <ToggleSwitch 
                checked={smallText} 
                onChange={onToggleSmallText} 
              />
            </div>

            <div className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="flex items-center">
                <Maximize size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Full width
              </div>
              <ToggleSwitch 
                checked={fullWidth} 
                onChange={onToggleFullWidth} 
              />
            </div>

            {/* Customize page */}
            <button
              onClick={handleCustomizePage}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <Edit3 size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Customize page
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Lock page toggle */}
            <div className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="flex items-center">
                <Lock size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Lock page
              </div>
              <ToggleSwitch 
                checked={isLocked} 
                onChange={handleToggleLock} 
              />
            </div>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Suggest edits */}
            <button
              onClick={handleSuggestEdits}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <Edit3 size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Suggest edits
            </button>

            {/* Translate */}
            <button
              onClick={handleTranslate}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <div className="flex items-center">
                <Languages size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Translate
              </div>
              <ChevronRight size={16} className={isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'} />
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Undo */}
            <button
              onClick={handleUndo}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <div className="flex items-center">
                <Undo size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Undo
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'}`}>
                Ctrl+Z
              </span>
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Import */}
            <button
              onClick={handleImport}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <Upload size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Import
            </button>

            {/* Export - Enhanced with loading state */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isExporting 
                  ? 'cursor-not-allowed' 
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                    : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="mr-3 w-4 h-4 border-2 border-[#F5D9D1] border-t-[#E65C52] rounded-full animate-spin"></div>
                  <span className={isDarkMode ? 'text-[#F5D9D1]' : 'text-[#E14C42]'}>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                  Export as PDF
                </>
              )}
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Turn into wiki */}
            <button
              onClick={handleTurnIntoWiki}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <RotateCcw size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Turn into wiki
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Updates & analytics */}
            <button
              onClick={handleUpdatesAnalytics}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <Clock size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Updates & analytics
            </button>

            {/* Version history */}
            <button
              onClick={handleVersionHistory}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <Clock size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Version history
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Notify me */}
            <button
              onClick={handleNotifyMe}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <div className="flex items-center">
                <Bell size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Notify me
              </div>
              <div className="flex items-center">
                <span className={`text-xs mr-2 ${isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'}`}>
                  Comments
                </span>
                <ChevronRight size={16} className={isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'} />
              </div>
            </button>

            {/* Connections */}
            <button
              onClick={handleConnections}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <div className="flex items-center">
                <Users size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
                Connections
              </div>
              <div className="flex items-center">
                <span className={`text-xs mr-2 ${isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'}`}>
                  None
                </span>
                <ChevronRight size={16} className={isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]'} />
              </div>
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Open in Windows app */}
            <button
              onClick={handleOpenInWindowsApp}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20' 
                  : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
              }`}
            >
              <Monitor size={16} className={`mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`} />
              Open in Windows app
            </button>

            <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>

            {/* Footer info */}
            <div className={`px-4 py-2.5 text-xs ${
              isDarkMode 
                ? 'text-[#F5D9D1]/70' 
                : 'text-[#E65C52]'
            }`}>
              <div className="font-medium">Word count: {note?.wordCount || 0} words</div>
              <div className="mt-1">Last edited by {note?.author || 'Unknown'}</div>
              <div className="text-[10px] opacity-75">
                {note?.lastEdited ? new Date(note.lastEdited).toLocaleString() : new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;