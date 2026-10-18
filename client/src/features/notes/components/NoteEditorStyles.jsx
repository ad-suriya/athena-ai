import PropTypes from 'prop-types';

// ProseMirror and read-only (.prose) styles. They depend on theme and text size,
// so they are generated at render time. (Kept as-is until the Tailwind phase.)
const NoteEditorStyles = ({ isDarkMode, smallText }) => (
  <style>{`
    .ProseMirror {
      outline: none;
      min-height: 500px;
      font-size: ${smallText ? '14px' : '16px'};
      line-height: 1.7;
    }

    .ProseMirror:focus {
      outline: none;
    }

    .ProseMirror p {
      margin: 0.75rem 0;
    }

    .ProseMirror h1 {
      font-size: ${smallText ? '2rem' : '2.5rem'};
      font-weight: 700;
      margin: 2rem 0 1rem 0;
      line-height: 1.2;
    }

    .ProseMirror h2 {
      font-size: ${smallText ? '1.5rem' : '1.875rem'};
      font-weight: 600;
      margin: 1.5rem 0 0.75rem 0;
      line-height: 1.3;
    }

    .ProseMirror h3 {
      font-size: ${smallText ? '1.25rem' : '1.5rem'};
      font-weight: 600;
      margin: 1.25rem 0 0.5rem 0;
      line-height: 1.4;
    }

    .ProseMirror ul,
    .ProseMirror ol {
      padding-left: 1.5rem;
      margin: 0.75rem 0;
    }

    .ProseMirror li {
      margin: 0.25rem 0;
    }

    .ProseMirror blockquote {
      border-left: 3px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
    }

    .ProseMirror code {
      background-color: ${isDarkMode ? '#374151' : '#f3f4f6'};
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family: 'Monaco', 'Consolas', monospace;
    }

    .ProseMirror img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }

    .ProseMirror a {
      color: #3b82f6;
      text-decoration: underline;
    }

    .ProseMirror table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
      border-radius: 0.5rem;
      overflow: hidden;
      border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
    }

    .ProseMirror th, .ProseMirror td {
      border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
      padding: 0.75rem;
      text-align: left;
    }

    .ProseMirror th {
      background-color: ${isDarkMode ? '#374151' : '#f9fafb'};
      font-weight: 600;
    }

    /* Empty state placeholder */
    .ProseMirror p.is-editor-empty:first-child::before {
      content: "Start writing...";
      color: ${isDarkMode ? '#6b7280' : '#9ca3af'};
      float: left;
      height: 0;
      pointer-events: none;
    }

    /* Prose class for read-only content */
    .prose {
      max-width: none;
      color: inherit;
    }

    .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
      line-height: 1.25;
    }

    .prose p {
      margin-top: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .prose ul, .prose ol {
      margin-top: 0.75rem;
      margin-bottom: 0.75rem;
      padding-left: 1.5rem;
    }

    .prose blockquote {
      border-left: 3px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
    }

    .prose-invert {
      color: white;
    }

    .prose-invert blockquote {
      border-left-color: #4b5563;
    }
  `}</style>
);

NoteEditorStyles.propTypes = {
  isDarkMode: PropTypes.bool,
  smallText: PropTypes.bool.isRequired,
};

export default NoteEditorStyles;
