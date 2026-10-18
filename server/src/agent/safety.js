'use strict';

// Safety step: spots crisis language (suicide, self-harm) in the user's message.
// When it matches, Athena answers that turn without tools or web search, is told to
// put the person first, and the app — not the model — adds support contacts under
// the reply, so the numbers are always right. Matching is deliberately broad:
// a gentle check-in on a false alarm costs far less than missing a real one.

const CRISIS_PATTERNS = [
  /\b(?:suicid(?:e|al)|kill(?:ing)?\s+my\s?self|end(?:ing)?\s+(?:my|it)\s+(?:life|all)|take\s+my\s+(?:own\s+)?life)\b/i,
  /\b(?:want(?:ed)?|wanna|plan(?:ning)?)\s+(?:to\s+)?die\b/i,
  /\b(?:don'?t|do\s+not|never)\s+want\s+to\s+(?:live|be\s+alive|wake\s+up|exist)(?:\s+any\s?more)?\b/i,
  /\b(?:no\s+(?:reason|point)\s+(?:to|in)\s+(?:live|living|go(?:ing)?\s+on)|better\s+off\s+(?:dead|without\s+me)|can'?t\s+go\s+on)\b/i,
  /\b(?:self[-\s]?harm(?:ing)?|hurt(?:ing)?\s+my\s?self|cut(?:ting)?\s+my\s?self|overdos(?:e|ing))\b/i,
];

const isCrisis = (text = '') => CRISIS_PATTERNS.some((p) => p.test(text));

// Told to the model on a crisis turn.
const SAFETY_NOTE = `Safety: the user's latest message may mean they are thinking about suicide or self-harm.
- Put the person first. Respond with warmth and without judgement; take what they said seriously.
- Gently ask whether they are safe right now, and encourage them to reach out to someone they trust or a crisis line.
- Do not give methods or details that could cause harm, and do not try to diagnose.
- The app adds crisis contacts under your reply. You may point to them, but do not write any phone numbers or websites yourself.
- Do not change any of the user's data in this reply.`;

// Support lines by the user's time zone. Kept to long-standing national services.
const US_CANADA = /^(?:America\/(?:New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Indiana\/.+|Kentucky\/.+|Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina)|Pacific\/Honolulu|US\/.+|Canada\/.+)$/;
const REGIONS = [
  { match: /^Asia\/(?:Kolkata|Calcutta)$/, lines: ['Tele-MANAS (free, 24/7): call 14416 or 1-800-891-4416'], emergency: '112' },
  { match: US_CANADA, lines: ['988 Suicide & Crisis Lifeline: call or text 988'], emergency: '911' },
  { match: /^Europe\/London$/, lines: ['Samaritans (free, 24/7): call 116 123'], emergency: '999' },
  { match: /^Europe\/Dublin$/, lines: ['Samaritans (free, 24/7): call 116 123'], emergency: '112' },
  { match: /^Australia\//, lines: ['Lifeline (24/7): call 13 11 14'], emergency: '000' },
];

// Plain text added under the reply (the chat shows line breaks, not markdown).
const crisisResources = (timeZone) => {
  const region = REGIONS.find((r) => r.match.test(timeZone || ''));
  return [
    'If you are thinking about suicide or self-harm, you don\'t have to face it alone. Please reach out now:',
    ...(region ? region.lines.map((l) => `• ${l}`) : []),
    '• Find a free helpline in your country: findahelpline.com',
    `• If you are in immediate danger, call ${region ? region.emergency : 'your local emergency number'}.`,
  ].join('\n');
};

module.exports = { isCrisis, SAFETY_NOTE, crisisResources };
