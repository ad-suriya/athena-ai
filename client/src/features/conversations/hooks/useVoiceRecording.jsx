import { useState, useRef, useEffect } from 'react';

export const useVoiceRecording = (setInputValue) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionState, setPermissionState] = useState('prompt');
  const [isRecognitionStarting, setIsRecognitionStarting] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

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

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

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

  return {
    isRecording,
    recordingError,
    audioLevel,
    permissionState,
    isRecognitionStarting,
    stopRecording,
    requestPermissionAgain,
    toggleRecording,
    setRecordingError,
  };
};
