'use strict';

// Journal entries are rich text (HTML from the TipTap editor). This turns one into
// plain text with paragraph breaks, for the AI tools and journal search.
const htmlToText = (html = '') => html
  .replace(/<\/(p|h[1-6]|li|div)>|<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

module.exports = { htmlToText };
