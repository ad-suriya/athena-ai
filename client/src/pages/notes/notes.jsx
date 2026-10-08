import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../components/SideBar';
import NoteEditor from './NoteEditor';

const Notes = ({ isDarkMode, onThemeToggle }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [, setIsEditing] = useState(true); // isEditing value was unused, but setter is kept if needed later
  const navigate = useNavigate();

  const createNewNote = useCallback(() => {
    const newNote = {
      id: Date.now(),
      title: 'New journal',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
        
    setNotes(prevNotes => {
      const updatedNotes = [...prevNotes, newNote];
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      return updatedNotes;
    });
    setSelectedNote(newNote);
    setIsEditing(true);
  }, []);

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    setNotes(savedNotes);
    
    // Create a new note automatically if none exists
    if (savedNotes.length === 0) {
      createNewNote();
    } else {
      // Select the first note and show editor
      setSelectedNote(savedNotes[0]);
      setIsEditing(true);
    }
  }, [createNewNote]); // Dependency array fixed

  const handleAutoSave = (updatedNote) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    
    if (!notes.some(note => note.id === updatedNote.id)) {
      updatedNotes.push(updatedNote);
    }
    
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    setSelectedNote(updatedNote);
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
    if (selectedNote && selectedNote.id === noteId) {
      if (updatedNotes.length > 0) {
        setSelectedNote(updatedNotes[0]);
        setIsEditing(true);
      } else {
        setSelectedNote(null);
        createNewNote(); // Create a new note if all are deleted
      }
    }
  };

  // Unused handleBackToHome removed

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <SideBar 
        isDarkMode={isDarkMode} 
        onThemeToggle={onThemeToggle}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <NoteEditor 
            isDarkMode={isDarkMode}
            initialNote={selectedNote}
            onSave={handleAutoSave}
            onDelete={() => handleDeleteNote(selectedNote.id)}
            onNavigateBack={() => setIsEditing(false)}
          />
        ) : (
          <div className={`h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="text-center">
              <div className={`text-6xl mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>📝</div>
              <h2 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Creating a new note...
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