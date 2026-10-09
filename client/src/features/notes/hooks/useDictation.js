import { useCallback, useEffect, useRef, useState } from 'react';

const getSpeechRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;

// Browser speech-to-text that inserts final transcripts into a TipTap editor at the cursor.
// Also meters microphone level while dictating (exposed as audioLevel, 0-100).
//
// Dictation state lives in a ref as well as in React state so that recognition and
// audio callbacks always see the current value (no stale closures, no effect restarts).
export const useDictation = (editor) => {
  const [isDictating, setIsDictating] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');

  const isDictatingRef = useRef(false);
  const editorRef = useRef(editor);
  editorRef.current = editor;

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const stop = useCallback(() => {
    isDictatingRef.current = false;

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsDictating(false);
    setAudioLevel(0);
    setTranscript('');
  }, []);

  // Microphone level metering. Failures are logged; dictation continues without it.
  const startAudioMeter = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      streamRef.current = stream;

      microphoneRef.current = audioContext.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (!isDictatingRef.current) return;

        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Scale to 0-100 with smoothing
        const scaledLevel = Math.min(100, Math.max(0, average * 100 / 256));
        setAudioLevel(prev => prev * 0.7 + scaledLevel * 0.3);

        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Error initializing audio visualization:', error);
    }
  };

  const createRecognition = (SpeechRecognition) => {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setTranscript(interimTranscript);

      if (finalTranscript !== '' && editorRef.current) {
        editorRef.current.commands.insertContent(finalTranscript);
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access is not allowed. Please enable microphone permissions in your browser settings.');
      }
      stop();
    };

    // Some browsers end continuous recognition on their own; restart while dictating.
    recognition.onend = () => {
      if (!isDictatingRef.current) return;
      try {
        recognition.start();
      } catch (e) {
        console.log('Could not restart recognition:', e);
        stop();
      }
    };

    return recognition;
  };

  const start = async () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (!editorRef.current) {
      alert('Editor not ready. Please try again.');
      return;
    }

    try {
      isDictatingRef.current = true;
      await startAudioMeter();

      const recognition = createRecognition(SpeechRecognition);
      recognitionRef.current = recognition;
      recognition.start();
      setIsDictating(true);
      setTranscript('Listening...');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Error starting speech recognition. Please check microphone permissions.');
      stop();
    }
  };

  const toggle = () => (isDictatingRef.current ? stop() : start());

  // Release the microphone and recognition when the editor unmounts.
  useEffect(() => stop, [stop]);

  return { isDictating, audioLevel, transcript, start, stop, toggle };
};
