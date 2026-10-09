import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ChevronDown, Leaf, MessageCircle, Mic, Plus, Send, Sparkles, Circle } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useVoiceRecording } from '../../../hooks/useVoiceRecording.jsx';

// Modes add a short context tag to the question, like Chat's [Search] tags.
const MODES = [
  { id: 'chat', label: 'Chat', icon: MessageCircle, tag: '' },
  { id: 'wellness', label: 'Wellness', icon: Leaf, tag: '[Wellness] ' },
  { id: 'productivity', label: 'Productivity', icon: CheckSquare, tag: '[Productivity] ' },
  { id: 'creative', label: 'Creative', icon: Sparkles, tag: '[Creative] ' },
];

// "Ask Athena": type or dictate a question, pick a mode, and continue in Chat.
const AskAthena = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [mode, setMode] = useState(MODES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  useClickOutside(pickerRef, () => setPickerOpen(false), pickerOpen);
  const { isRecording, toggleRecording, recordingError } = useVoiceRecording(setText);

  const submit = (e) => {
    e?.preventDefault();
    const question = text.trim();
    if (!question) return;
    navigate('/chat', { state: { prompt: mode.tag + question } });
  };

  return (
    <section className="rounded-card border border-brand-200 bg-gradient-to-b from-[#FFF7F5] to-white p-5 shadow-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4">
          <Sparkles className="mt-1 h-7 w-7 shrink-0 text-brand-500" strokeWidth={1.8} />
          <div>
            <h2 className="text-[21px] font-semibold text-brand-500">Ask Athena</h2>
            <p className="mt-0.5 text-[15px] text-ink-muted">Chat, plan, journal, or get guidance — all in one place.</p>
          </div>
        </div>
        <div ref={pickerRef} className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink hover:bg-brand-50"
            aria-label={`Mode: ${mode.id === 'chat' ? 'General' : mode.label}`}
            aria-expanded={pickerOpen}
          >
            <Circle className="h-4 w-4 text-ink-muted" />
            {mode.id === 'chat' ? 'General' : mode.label}
            <ChevronDown className="h-4 w-4 text-ink-muted" />
          </button>
          {pickerOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-2xl border border-line bg-white p-1.5 shadow-card">
              {MODES.map((m) => (
                <button key={m.id} type="button" onClick={() => { setMode(m); setPickerOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-brand-50">
                  <m.icon className="h-4 w-4 text-ink-muted" /> {m.id === 'chat' ? 'General' : m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 rounded-2xl border border-line bg-white p-4 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100">
        <input
          id="ask-athena"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isRecording ? 'Listening…' : 'Ask anything...'}
          className="w-full bg-transparent px-1 text-[17px] text-ink placeholder:text-ink-faint focus:outline-none"
          aria-label="Ask Athena"
        />
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => navigate('/chat')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F1F1] text-ink-muted hover:bg-brand-50" aria-label="Open a new chat">
            <Plus className="h-5 w-5" />
          </button>
          {MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => setMode(m)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                mode.id === m.id ? 'border-brand-100 bg-brand-100 text-brand-600' : 'border-line bg-white text-ink hover:bg-brand-50'
              }`}
              aria-pressed={mode.id === m.id}
            >
              <m.icon className={`h-4 w-4 ${m.id === 'wellness' ? 'text-emerald-600' : ''}`} /> {m.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button type="button" onClick={toggleRecording}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${isRecording ? 'bg-brand-100 text-brand-600' : 'bg-[#F3F1F1] text-ink hover:bg-brand-50'}`}
              aria-label={isRecording ? 'Stop dictation' : 'Dictate'} aria-pressed={isRecording}>
              <Mic className="h-5 w-5" />
            </button>
            <button type="submit" disabled={!text.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_6px_16px_rgba(230,92,82,0.35)] hover:bg-brand-600 disabled:cursor-not-allowed disabled:hover:bg-brand-500"
              aria-label="Send to Athena">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
        {recordingError && <p className="mt-2 text-xs text-brand-600">{recordingError}</p>}
      </form>
    </section>
  );
};

export default AskAthena;
