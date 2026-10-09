import PropTypes from 'prop-types';
import { Redo2, Undo2 } from 'lucide-react';

// Undo/redo on the left; dictation stop, Save and the options menu on the right.
const NoteEditorHeader = ({ isDarkMode, editor, isLocked, isDictating, onStopDictation, onSave, menu }) => {
  const iconButtonClass = `p-2 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors disabled:opacity-50`;

  return (
    <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run() || isLocked}
          className={iconButtonClass}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run() || isLocked}
          className={iconButtonClass}
        >
          <Redo2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {isDictating ? (
          <button
            onClick={onStopDictation}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors bg-red-500 text-white hover:bg-red-600"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span>Stop</span>
          </button>
        ) : (
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></span>
        )}

        <button
          onClick={onSave}
          disabled={isLocked}
          className="px-3 py-1 rounded-md bg-[#E25752] hover:bg-[#D14C47] text-white transition-colors disabled:opacity-50"
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
  onStopDictation: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  menu: PropTypes.node.isRequired,
};

export default NoteEditorHeader;
