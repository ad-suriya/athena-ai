import PropTypes from 'prop-types';
import { Redo2, Undo2 } from 'lucide-react';

// Optional leading control (phone back button), undo/redo; save state, dictation stop,
// Save and the options menu on the right.
const NoteEditorHeader = ({ isDarkMode, editor, isLocked, isDictating, isDirty, onStopDictation, onSave, menu, leading }) => {
  const iconButtonClass = `rounded-lg p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-ink-muted hover:bg-brand-50 hover:text-brand-500'} transition-colors disabled:opacity-40`;

  return (
    <div className={`flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-4 ${isDarkMode ? 'border-gray-700' : 'border-line bg-white/60'}`}>
      <div className="flex items-center gap-1">
        {leading}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          aria-label="Undo"
          disabled={!editor.can().chain().focus().undo().run() || isLocked}
          className={iconButtonClass}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          aria-label="Redo"
          disabled={!editor.can().chain().focus().redo().run() || isLocked}
          className={iconButtonClass}
        >
          <Redo2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {!isDictating && (
          <span className={`hidden text-sm sm:inline ${isDirty ? 'text-ink-muted' : 'text-ink-faint'}`} aria-live="polite">
            {isDirty ? 'Unsaved changes' : 'Saved'}
          </span>
        )}
        {isDictating ? (
          <button
            onClick={onStopDictation}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span>Stop</span>
          </button>
        ) : null}

        <button
          onClick={onSave}
          disabled={isLocked}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          Save
        </button>

        {menu}
      </div>
    </div>
  );
};

NoteEditorHeader.propTypes = {
  isDarkMode: PropTypes.bool,
  // TipTap Editor instance
  editor: PropTypes.shape({
    chain: PropTypes.func.isRequired,
    can: PropTypes.func.isRequired,
  }).isRequired,
  isLocked: PropTypes.bool.isRequired,
  isDictating: PropTypes.bool.isRequired,
  isDirty: PropTypes.bool,
  onStopDictation: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  menu: PropTypes.node.isRequired,
  leading: PropTypes.node,
};

export default NoteEditorHeader;
