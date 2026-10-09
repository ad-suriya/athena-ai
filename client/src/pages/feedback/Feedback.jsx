import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { sendFeedback } from '../../services/feedbackService';

const TYPES = [
  { id: 'bug', label: 'Something is broken' },
  { id: 'suggestion', label: 'Suggestion or feature idea' },
  { id: 'other', label: 'Other' },
];

const field = 'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100';

// "Send feedback": saved to the feedback collection through the API.
const Feedback = () => {
  const user = useCurrentUser();
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(null); // null = use the account email
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const replyTo = email ?? user?.email ?? '';

  const submit = async (e) => {
    e.preventDefault();
    if (!type || !message.trim()) return;
    setStatus('sending');
    try {
      await sendFeedback({ type, message: message.trim(), email: replyTo.trim(), context: { page: 'feedback' } });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setType('');
    setMessage('');
    setStatus('idle');
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-card border border-line bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Send feedback</h1>
        <p className="mt-1 text-sm text-ink-muted">Tell us what isn’t working or what you’d like Athena to do.</p>

        {status === 'sent' ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-ink" role="status">Thanks — your feedback was sent.</p>
            <button onClick={reset} className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50">Send more feedback</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="feedback-type" className="mb-2 block text-sm font-medium text-ink">Type</label>
              <select id="feedback-type" value={type} onChange={(e) => setType(e.target.value)} className={field}>
                <option value="">Choose one</option>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium text-ink">What happened?</label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                maxLength={5000}
                placeholder="What were you trying to do, what did you expect, and what happened instead?"
                className={`${field} resize-none`}
              />
            </div>
            <div>
              <label htmlFor="feedback-email" className="mb-2 block text-sm font-medium text-ink">Email for a reply (optional)</label>
              <input id="feedback-email" type="email" value={replyTo} onChange={(e) => setEmail(e.target.value)} maxLength={320} className={field} />
            </div>
            {status === 'error' && <p className="text-sm text-brand-700" role="alert">Couldn’t send your feedback. Please try again.</p>}
            <button
              type="submit"
              disabled={!type || !message.trim() || status === 'sending'}
              className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
