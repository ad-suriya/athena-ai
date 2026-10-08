import { useState, useEffect, useCallback, useRef } from 'react';
import * as noteService from '../../../services/noteService';

// An unsaved note shown when the user has none. It is only persisted on first Save,
// so opening the page never creates empty notes on the server.
const createDraft = () => ({
  id: null,
  title: 'New journal',
  content: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  // Changes only when a *different* note is selected, so the editor remounts then
  // but not when the current note is saved.
  const [selectionKey, setSelectionKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedRef = useRef(selectedNote);
  selectedRef.current = selectedNote;
  const notesRef = useRef(notes);
  notesRef.current = notes;
  // Resolves to the server id while the draft's first save is in flight,
  // so a second Save click updates instead of creating a duplicate.
  const pendingCreate = useRef(null);

  const selectNote = useCallback((note) => {
    pendingCreate.current = null;
    setSelectedNote(note);
    setSelectionKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    noteService
      .getNotes()
      .then((data) => {
        if (cancelled) return;
        setNotes(data);
        selectNote(data.length > 0 ? data[0] : createDraft());
      })
      .catch((err) => {
        if (cancelled) return;
        setError(`Could not load notes: ${err.message}`);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectNote]);

  // `editorNote` is the editor's copy; its id may be stale (null) after the first save,
  // so the id is always taken from the hook's selected note.
  const saveNote = useCallback(async (editorNote) => {
    const fields = { title: editorNote.title ?? '', content: editorNote.content ?? '' };
    let createPromise = null;
    try {
      const id = selectedRef.current?.id || (pendingCreate.current ? await pendingCreate.current : null);
      let saved;
      if (id) {
        saved = await noteService.updateNote(id, fields);
        setNotes((prev) => prev.map((n) => (n.id === id ? saved : n)));
      } else {
        createPromise = noteService.createNote(fields);
        pendingCreate.current = createPromise.then((created) => created.id);
        saved = await createPromise;
        setNotes((prev) => [...prev, saved]);
      }
      setSelectedNote(saved);
      setError(null);
      return saved;
    } catch (err) {
      if (createPromise) pendingCreate.current = null;
      setError(`Could not save note: ${err.message}`);
      return null;
    }
  }, []);

  const deleteNote = useCallback(async () => {
    const current = selectedRef.current;
    if (!current) return;
    try {
      if (current.id) await noteService.deleteNote(current.id);
      const remaining = notesRef.current.filter((n) => n.id !== current.id);
      setNotes(remaining);
      selectNote(remaining.length > 0 ? remaining[0] : createDraft());
      setError(null);
    } catch (err) {
      setError(`Could not delete note: ${err.message}`);
    }
  }, [selectNote]);

  return { notes, selectedNote, selectionKey, isLoading, error, saveNote, deleteNote };
};
