// Reading chat attachments in the browser. Limits match the API (conversations.controller.js).

export const ATTACHMENT_ACCEPT = 'image/png,image/jpeg,image/webp,image/heic,image/heif,application/pdf,text/plain,text/markdown,text/csv,.md,.csv,.txt';
const TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv'];
const BY_EXTENSION = { md: 'text/markdown', csv: 'text/csv', txt: 'text/plain' };
export const MAX_ATTACHMENTS = 4;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

// Browsers often leave .md/.csv types blank.
const mimeTypeOf = (file) => file.type || BY_EXTENSION[file.name.split('.').pop().toLowerCase()] || '';

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

// Adds files to the current list. → { attachments, error } (error: first problem, or null).
export const addAttachments = async (current, fileList) => {
  const files = Array.from(fileList || []);
  const next = [...current];
  let error = null;
  for (const file of files) {
    const mimeType = mimeTypeOf(file);
    if (next.length >= MAX_ATTACHMENTS) { error = `You can attach up to ${MAX_ATTACHMENTS} files.`; break; }
    if (!TYPES.includes(mimeType)) { error = `${file.name}: only images, PDFs and text files are supported.`; continue; }
    if (file.size > MAX_FILE_BYTES) { error = `${file.name} is larger than 5 MB.`; continue; }
    if (next.reduce((sum, a) => sum + a.size, 0) + file.size > MAX_TOTAL_BYTES) { error = 'Attachments must total 10 MB or less.'; continue; }
    next.push({ name: file.name, mimeType, size: file.size, data: await toBase64(file) });
  }
  return { attachments: next, error };
};
