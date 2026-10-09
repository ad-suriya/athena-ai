import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import NoteEditor from './NoteEditor';
import { useNotes } from './hooks/useNotes';

// Journal page. ?id=<noteId> opens that entry; ?new=1 starts a blank one.
const NotesPage = ({ isDarkMode = false, noteId, startNew }) => {
  const { selectedNote, selectionKey, isLoading, error, saveNote, deleteNote } = useNotes({ noteId, startNew });

  return (
    <div className={`flex h-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>
        )}
        {selectedNote ? (
          <NoteEditor 
            key={selectionKey}
            isDarkMode={isDarkMode}
            initialNote={selectedNote}
            onSave={saveNote}
            onDelete={deleteNote}
          />
        ) : (
          <div className={`h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="text-center">
              <div className={`text-6xl mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>📝</div>
              <h2 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {isLoading ? 'Loading notes...' : 'Notes unavailable'}
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

NotesPage.propTypes = {
  isDarkMode: PropTypes.bool,
  noteId: PropTypes.string,
  startNew: PropTypes.bool.isRequired,
};

// Remounts when the query changes, so following a link to another entry reloads the selection.
const Notes = () => {
  const [params] = useSearchParams();
  return <NotesPage key={params.toString()} noteId={params.get('id')} startNew={params.get('new') === '1'} />;
};

export default Notes;