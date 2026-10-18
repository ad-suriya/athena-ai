import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const SCALES = [
  { key: 'mood', label: 'Mood', low: 'Low', high: 'Great' },
  { key: 'energy', label: 'Energy', low: 'Drained', high: 'Energised' },
  { key: 'stress', label: 'Stress', low: 'Calm', high: 'Overwhelmed' },
];

// Modal form for a wellness check-in. onSave(values) persists it; errors are shown inline.
const MoodCheckInDialog = ({ open, onClose, onSave }) => {
  const ref = useRef(null);
  const [values, setValues] = useState({ mood: 6, energy: 6, stress: 4 });
  const [sleepHours, setSleepHours] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Keep the native <dialog> in sync with `open`.
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...values,
        ...(sleepHours !== '' ? { sleepHours: Number(sleepHours) } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setNote('');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save your check-in.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={ref} onClose={onClose} className="w-[min(480px,calc(100vw-32px))] rounded-card border border-line p-0 shadow-card backdrop:bg-ink/30">
      <form onSubmit={submit} className="space-y-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">How are you feeling?</h2>
            <p className="mt-1 text-sm text-ink-muted">A quick check-in. It takes ten seconds.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {SCALES.map((s) => (
          <div key={s.key}>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`checkin-${s.key}`} className="text-sm font-medium text-ink">{s.label}</label>
              <span className="text-sm font-semibold tabular-nums text-brand-500">{values[s.key]}/10</span>
            </div>
            <input
              id={`checkin-${s.key}`} type="range" min="1" max="10" value={values[s.key]}
              onChange={(e) => setValues((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
              className="mt-2 w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-ink-faint"><span>{s.low}</span><span>{s.high}</span></div>
          </div>
        ))}

        <div className="grid grid-cols-[120px_1fr] items-center gap-3">
          <label htmlFor="checkin-sleep" className="text-sm font-medium text-ink">Hours of sleep</label>
          <input id="checkin-sleep" type="number" min="0" max="24" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)}
            placeholder="Optional" className="rounded-xl border border-line px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100" />
        </div>
        <div>
          <label htmlFor="checkin-note" className="text-sm font-medium text-ink">Anything on your mind?</label>
          <textarea id="checkin-note" rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional"
            className="mt-2 w-full resize-none rounded-xl border border-line px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100" />
        </div>

        {error && <p className="text-sm text-brand-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm text-ink-muted hover:bg-brand-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save check-in'}
          </button>
        </div>
      </form>
    </dialog>
  );
};

MoodCheckInDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default MoodCheckInDialog;
