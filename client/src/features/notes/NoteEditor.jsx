import { useState } from 'react';
import PropTypes from 'prop-types';
import { EditorContent } from '@tiptap/react';
import { useNoteEditor } from './hooks/useNoteEditor';
import { useDictation } from './hooks/useDictation';
import NoteEditorHeader from './components/NoteEditorHeader';
import NoteOptionsMenu from './components/NoteOptionsMenu';
import NoteFormattingToolbar from './components/NoteFormattingToolbar';
import NoteImageInput from './components/NoteImageInput';
import NoteEditorStyles from './components/NoteEditorStyles';

const formatToday = () => new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Rich-text note editor: title, TipTap body, formatting toolbar, options menu.
// Works standalone (no props) or with a note and save/delete callbacks from useNotes.
const NoteEditor = ({ isDarkMode = false, initialNote, onSave, onDelete }) => {
  const { note, setTitle, editor, isLocked, toggleLock, insertImage, setLink, insertTable } = useNoteEditor(initialNote);
  const dictation = useDictation(editor);

  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [fullWidth, setFullWidth] = useState(false);
  const [smallText, setSmallText] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(note);
    }
  };

  const handleAddImage = () => {
    if (insertImage(imageUrl)) {
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  if (!editor) {
    return <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>Loading editor...</div>;
  }

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#FCF4F1] text-gray-900'}`}>
      <NoteEditorHeader
        isDarkMode={isDarkMode}
        editor={editor}
        isLocked={isLocked}
        isDictating={dictation.isDictating}
        onStopDictation={dictation.stop}
        onSave={handleSave}
        menu={
          <NoteOptionsMenu
            isDarkMode={isDarkMode}
            editor={editor}
            note={note}
            onDelete={onDelete}
            dictation={dictation}
            fullWidth={fullWidth}
            onToggleFullWidth={() => setFullWidth(!fullWidth)}
            smallText={smallText}
            onToggleSmallText={() => setSmallText(!smallText)}
            isLocked={isLocked}
            onToggleLock={toggleLock}
          />
        }
      />

      <div className="flex-1 overflow-auto">
        <div className={`h-full py-6 ${fullWidth ? '' : 'max-w-3xl mx-auto'}`}>
          <div className="px-6 mb-6">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
              {formatToday()}
            </p>
          </div>
          <div className="px-6 mb-2">
            <input
              type="text"
              value={note.title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={isLocked}
              className={`${smallText ? 'text-2xl' : 'text-4xl'} font-bold bg-transparent border-none outline-none w-full placeholder-gray-400 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
              placeholder="New journal"
            />
          </div>

          {showImageInput && !isLocked && (
            <NoteImageInput
              isDarkMode={isDarkMode}
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
              onAdd={handleAddImage}
              onCancel={() => setShowImageInput(false)}
            />
          )}

          <div className="px-6">
            {isLocked ? (
              <div
                className={`min-h-[500px] outline-none prose ${isDarkMode ? 'prose-invert' : ''} cursor-not-allowed opacity-90`}
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            ) : (
              <EditorContent
                editor={editor}
                className="min-h-[500px] outline-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Always mounted: TipTap moves the bubble menu's DOM into a popup, so unmounting it
          on lock crashed React (removeChild). It hides itself while the editor is read-only. */}
      <NoteFormattingToolbar
        editor={editor}
        isDarkMode={isDarkMode}
        isLocked={isLocked}
        onSetLink={setLink}
        onToggleImageInput={() => setShowImageInput(!showImageInput)}
        onInsertTable={insertTable}
      />

      <NoteEditorStyles isDarkMode={isDarkMode} smallText={smallText} />
    </div>
  );
};

NoteEditor.propTypes = {
  isDarkMode: PropTypes.bool,
  initialNote: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
};

export default NoteEditor;
