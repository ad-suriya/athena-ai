import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NoteEditor from './NoteEditor';
import JournalList from './components/JournalList';
import { useNotes } from './hooks/useNotes';

const DISCARD_PROMPT = 'You have unsaved changes in this entry. Discard them?';

// Journal: entry list + editor. The URL holds the selection (?id=<entryId> or ?new=1),
// so links from Home and search open the right entry and refresh keeps it.
// Desktop shows both columns; phones show the list until an entry is opened.
const Notes = () => {
  const [params, setParams] = useSearchParams();
  const paramId = params.get('id');
  const isNew = params.get('new') === '1';
  const {
    notes, selectedNote, selectionKey, isLoading, error,
    saveNote, deleteNote, openNote, startNewNote, duplicateNote,
  } = useNotes({ noteId: paramId, startNew: isNew });

  const entries = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),
    [notes]
  );
  const selectedId = selectedNote?.id || null;

  // Unsaved edits in the editor; checked before switching entries.
  const dirtyRef = useRef(false);
  const handleDirtyChange = useCallback((dirty) => { dirtyRef.current = dirty; }, []);
  const confirmDiscard = () => !dirtyRef.current || window.confirm(DISCARD_PROMPT);

  const selectEntry = (id) => {
    if (id === selectedId) { setParams({ id }); return; }
    if (!confirmDiscard()) return;
    openNote(id);
    setParams({ id });
  };

  // Copies what the editor shows; unsaved edits stay only in the copy.
  const duplicateEntry = async (editorNote) => {
    if (!confirmDiscard()) return;
    const copy = await duplicateNote(editorNote);
    if (copy) setParams({ id: copy.id });
  };

  const newEntry = () => {
    if (!confirmDiscard()) return;
    startNewNote();
    setParams({ new: '1' });
  };

  // URL changed from outside (search, Home, back/forward): follow it.
  // Handlers are read through a ref so this only depends on the URL.
  const latest = useRef(null);
  latest.current = { selectedId, openNote, startNewNote };
  useEffect(() => {
    const { selectedId: current, openNote: open, startNewNote: startNew } = latest.current;
    if (isNew && current) startNew();
    else if (paramId && paramId !== current) open(paramId);
  }, [paramId, isNew]);

  // Selection changed in the hook (a new entry was saved, or an entry was deleted):
  // keep the URL pointing at what is shown. The URL is read through a ref so this
  // only reacts to selection changes, not to URL changes.
  const url = useRef(null);
  url.current = { paramId, isNew, setParams };
  useEffect(() => {
    const { paramId: id, isNew: draft, setParams: set } = url.current;
    if (!selectedId) return;
    if (draft || (id && id !== selectedId)) set({ id: selectedId }, { replace: true });
  }, [selectedId]);

  const editorOpenOnPhone = Boolean(paramId) || isNew;

  return (
    <div className="flex h-full bg-white">
      <aside className={`w-full shrink-0 border-r border-line bg-[#FFFAF9] md:block md:w-80 ${editorOpenOnPhone ? 'hidden' : 'block'}`}>
        <JournalList
          entries={entries}
          selectedId={selectedId}
          isDraftSelected={Boolean(selectedNote) && !selectedId}
          isLoading={isLoading}
          onSelect={selectEntry}
          onNew={newEntry}
        />
      </aside>

      <section className={`min-w-0 flex-1 flex-col ${editorOpenOnPhone ? 'flex' : 'hidden md:flex'}`}>
        {error && (
          <div className="border-b border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700" role="alert">{error}</div>
        )}
        {selectedNote ? (
          <NoteEditor
            key={selectionKey}
            initialNote={selectedNote}
            onSave={saveNote}
            onDelete={deleteNote}
            onDuplicate={duplicateEntry}
            onDirtyChange={handleDirtyChange}
            headerLeading={
              <button
                type="button"
                onClick={() => { if (confirmDiscard()) setParams({}); }}
                className="mr-1 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-ink hover:bg-brand-50 md:hidden"
              >
                <ArrowLeft className="h-4 w-4" /> All entries
              </button>
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">
            {isLoading ? 'Loading your journal…' : 'Journal unavailable'}
          </div>
        )}
      </section>
    </div>
  );
};

export default Notes;
