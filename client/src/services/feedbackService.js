// Feedback API: bug reports and suggestions.
import { post } from './api';

// type: 'bug' | 'suggestion' | 'harmful' | 'inaccurate' | 'unhelpful' | 'other'
// context (optional): { page, conversationId, messageId }
export const sendFeedback = ({ type, message, email, context }) =>
  post('/api/feedback', { type, message, ...(email ? { email } : {}), ...(context ? { context } : {}) });
