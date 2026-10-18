import PropTypes from 'prop-types';
import { BubbleMenu } from '@tiptap/react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Code, Image as ImageIcon, Italic,
  Link2 as LinkIcon, Minus, Strikethrough, Table as TableIcon
} from 'lucide-react';

const ACTIVE = 'bg-brand-100 text-brand-600 dark:bg-brand-700 dark:text-brand-100';
const IDLE = 'hover:bg-brand-50 dark:hover:bg-gray-700 text-ink-muted dark:text-gray-400';

// isActive: undefined for buttons that never show an active state.
const ToolbarButton = ({ onClick, isActive, title, disabled, children }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition-colors ${isActive ? ACTIVE : IDLE}`}
    title={title}
    disabled={disabled}
  >
    {children}
  </button>
);

ToolbarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  title: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

const Separator = ({ isDarkMode }) => (
  <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-line'}`}></div>
);

Separator.propTypes = { isDarkMode: PropTypes.bool };

const currentHeadingLevel = (editor) => (
  editor.isActive('heading', { level: 1 }) ? 1 :
  editor.isActive('heading', { level: 2 }) ? 2 :
  editor.isActive('heading', { level: 3 }) ? 3 : 0
);

// Floating toolbar shown over a text selection: block type, marks, alignment,
// divider, link, image and table.
const NoteFormattingToolbar = ({ editor, isDarkMode, isLocked, onSetLink, onToggleImageInput, onInsertTable }) => {
  const run = (command) => () => command(editor.chain().focus()).run();

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        maxWidth: 'none'
      }}
      className={`flex flex-wrap items-center gap-1 rounded-2xl border p-2 ${
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-line shadow-card'
      }`}
    >
      <select
        onChange={(e) => {
          const level = parseInt(e.target.value);
          if (level === 0) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
        className={`px-2 py-1 rounded text-sm border-none ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-[#F5F2F1] text-ink'} cursor-pointer outline-none`}
        value={currentHeadingLevel(editor)}
      >
        <option value={0}>Paragraph</option>
        <option value={1}>Heading 1</option>
        <option value={2}>Heading 2</option>
        <option value={3}>Heading 3</option>
      </select>

      <Separator isDarkMode={isDarkMode} />

      <ToolbarButton onClick={run(c => c.toggleBold())} isActive={editor.isActive('bold')} title="Bold">
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={run(c => c.toggleItalic())} isActive={editor.isActive('italic')} title="Italic">
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={run(c => c.toggleUnderline())} isActive={editor.isActive('underline')} title="Underline">
        <span className="underline text-sm font-medium">U</span>
      </ToolbarButton>
      <ToolbarButton onClick={run(c => c.toggleStrike())} isActive={editor.isActive('strike')} title="Strikethrough">
        <Strikethrough size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={run(c => c.toggleCode())} isActive={editor.isActive('code')} title="Code">
        <Code size={16} />
      </ToolbarButton>

      <Separator isDarkMode={isDarkMode} />

      <ToolbarButton onClick={run(c => c.setTextAlign('left'))} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={run(c => c.setTextAlign('center'))} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={run(c => c.setTextAlign('right'))} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
        <AlignRight size={16} />
      </ToolbarButton>

      <Separator isDarkMode={isDarkMode} />

      <ToolbarButton onClick={run(c => c.setHorizontalRule())} title="Divider">
        <Minus size={16} />
      </ToolbarButton>

      <Separator isDarkMode={isDarkMode} />

      <ToolbarButton onClick={onSetLink} isActive={editor.isActive('link')} title="Link" disabled={isLocked}>
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={onToggleImageInput} title="Insert Image" disabled={isLocked}>
        <ImageIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertTable} title="Insert Table" disabled={isLocked}>
        <TableIcon size={16} />
      </ToolbarButton>
    </BubbleMenu>
  );
};

NoteFormattingToolbar.propTypes = {
  // TipTap Editor instance
  editor: PropTypes.shape({
    chain: PropTypes.func.isRequired,
    isActive: PropTypes.func.isRequired,
  }).isRequired,
  isDarkMode: PropTypes.bool,
  isLocked: PropTypes.bool.isRequired,
  onSetLink: PropTypes.func.isRequired,
  onToggleImageInput: PropTypes.func.isRequired,
  onInsertTable: PropTypes.func.isRequired,
};

export default NoteFormattingToolbar;
