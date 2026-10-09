import { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { sendFeedback } from '../../../services/feedbackService';

const REPORT_TYPES = [
  { id: 'inaccurate', label: 'Inaccurate or made up' },
  { id: 'harmful', label: 'Harmful or unsafe' },
  { id: 'unhelpful', label: 'Not helpful' },
  { id: 'bug', label: 'Something is broken' },
  { id: 'other', label: 'Other' },
];

// Reports a problem with one Athena reply. The report is saved with the
// conversation and message IDs so it can be looked up later.
const ReportIssueModal = ({ isOpen, onClose, conversationId, messageId }) => {
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!type || !details.trim()) return;
    setStatus('sending');
    try {
      await sendFeedback({
        type,
        message: details.trim(),
        context: { page: 'chat', ...(conversationId ? { conversationId } : {}), ...(messageId ? { messageId } : {}) },
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="report-title" className="text-lg font-semibold text-ink">Report this reply</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="space-y-4 px-6 py-6">
            <p className="text-sm text-ink">Thanks — your report was sent.</p>
            <div className="flex justify-end">
              <button onClick={onClose} className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 px-6 py-5">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink">What went wrong?</legend>
              <div className="space-y-1.5">
                {REPORT_TYPES.map((t) => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-brand-50">
                    <input type="radio" name="report-type" value={t.id} checked={type === t.id} onChange={() => setType(t.id)} className="accent-brand-500" />
                    {t.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="report-details" className="mb-2 block text-sm font-medium text-ink">Details</label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={5000}
                rows={5}
                placeholder="Tell us what happened"
                className="w-full resize-none rounded-xl border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100"
              />
            </div>
            {status === 'error' && <p className="text-sm text-brand-700" role="alert">Couldn’t send the report. Please try again.</p>}
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-ink-muted hover:bg-brand-50">Cancel</button>
              <button
                type="submit"
                disabled={!type || !details.trim() || status === 'sending'}
                className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

ReportIssueModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  conversationId: PropTypes.string,
  messageId: PropTypes.string,
};

export default ReportIssueModal;
