import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, ChevronDown, Check } from 'lucide-react';

const ReadAloudButton = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('female');
  const [availableVoices, setAvailableVoices] = useState([]);
  const speechSynthRef = useRef(null);
  const dropdownRef = useRef(null);

  // Standard voice options (fallback if browser voices aren't available)
  const voiceOptions = [
    {
      id: 'female',
      name: 'Female Voice',
      pitch: 1.0,
      rate: 1.0,
      lang: 'en-US'
    },
    {
      id: 'male',
      name: 'Male Voice',
      pitch: 0.85,
      rate: 0.95,
      lang: 'en-US'
    }
  ];

  // Load saved voice preference and available voices
  useEffect(() => {
    // Load saved preference
    const savedVoice = localStorage.getItem('preferredVoice');
    if (savedVoice) setSelectedVoice(savedVoice);

    // Load available browser voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    // Chrome needs this
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowVoiceOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleReadAloud = () => {
    if (isPlaying) {
      stopSpeech();
    } else {
      startSpeech(text);
    }
  };

  const startSpeech = (text) => {
    stopSpeech(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceConfig = voiceOptions.find(v => v.id === selectedVoice);

    // Try to find a matching voice in browser voices
    if (availableVoices.length > 0) {
      const preferredVoice = availableVoices.find(voice => {
        if (selectedVoice === 'female') {
          return voice.name.toLowerCase().includes('female') || 
                 voice.name.includes('Samantha') ||
                 voice.name.includes('Zira');
        } else {
          return voice.name.toLowerCase().includes('male') || 
                 voice.name.includes('Alex') ||
                 voice.name.includes('David');
        }
      });

      if (preferredVoice) utterance.voice = preferredVoice;
    }

    // Apply voice settings
    utterance.pitch = voiceConfig.pitch;
    utterance.rate = voiceConfig.rate;
    utterance.lang = voiceConfig.lang;

    // Event handlers
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const selectVoice = (voiceId) => {
    setSelectedVoice(voiceId);
    setShowVoiceOptions(false);
    localStorage.setItem('preferredVoice', voiceId);

    // Restart speech if currently playing
    if (isPlaying) {
      stopSpeech();
      startSpeech(text);
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Main read aloud button */}
      <button
        onClick={toggleReadAloud}
        className={`p-1.5 rounded-lg transition-all duration-300 ${
          isPlaying
            ? 'bg-blue-100 text-blue-600 scale-110'
            : 'bg-gray-100 hover:bg-gray-200 hover:scale-105 text-gray-600'
        }`}
        title={isPlaying ? "Stop reading" : "Read aloud"}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Voice selection button */}
      <button
        className="ml-1 p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          setShowVoiceOptions(!showVoiceOptions);
        }}
        title="Change voice"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Voice options dropdown */}
      {showVoiceOptions && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-32">
          {voiceOptions.map((voice) => (
            <div
              key={voice.id}
              className="px-3 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer text-sm"
              onClick={() => selectVoice(voice.id)}
            >
              <span>{voice.name}</span>
              {selectedVoice === voice.id && (
                <Check className="w-4 h-4 text-blue-500 ml-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadAloudButton;