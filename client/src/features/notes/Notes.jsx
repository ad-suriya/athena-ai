import PropTypes from 'prop-types';
import SideBar from '../../components/sidebar/Sidebar';
import NoteEditor from './NoteEditor';
import { useNotes } from './hooks/useNotes';

const Notes = ({ isDarkMode, onThemeToggle }) => {
  const { selectedNote, selectionKey, isLoading, error, saveNote, deleteNote } = useNotes();

  // Unused handleBackToHome removed

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <SideBar 
        isDarkMode={isDarkMode} 
        onThemeToggle={onThemeToggle}
      />
      
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

Notes.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  onThemeToggle: PropTypes.func.isRequired,
};

export default Notes;