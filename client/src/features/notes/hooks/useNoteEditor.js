import { useCallback, useEffect, useState } from 'react';
import { useEditor } from '@tiptap/react';
import { createEditorExtensions } from '../utils/editorExtensions';

const createDefaultNote = () => ({
  id: Date.now(),
  title: 'New journal',
  content: '',
  category: 'Personal',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// The editor's working copy of a note plus the TipTap editor bound to it.
// Locking makes both the title and the editor read-only.
//
// initialNote is read once: the editor is remounted (keyed) when a different
// note is selected, so later changes to the prop (e.g. after Save) are ignored
// instead of resetting the editor content and cursor.
export const useNoteEditor = (initialNote) => {
  const [note, setNote] = useState(() => initialNote || createDefaultNote());
  const [isLocked, setIsLocked] = useState(false);

  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: note.content,
    editable: !isLocked,
    onUpdate: ({ editor }) => {
      if (!isLocked) {
        const content = editor.getHTML();
        setNote(prev => ({
          ...prev,
          content,
          updatedAt: new Date().toISOString()
        }));
      }
    },
  });

  // Sync TipTap's editable flag with the lock.
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [isLocked, editor]);

  const setTitle = (title) => {
    if (isLocked) return;
    setNote(prev => ({
      ...prev,
      title,
      updatedAt: new Date().toISOString()
    }));
  };

  const toggleLock = () => setIsLocked(prev => !prev);

  const insertImage = useCallback((url) => {
    if (url && !isLocked) {
      editor.chain().focus().setImage({ src: url }).run();
      return true;
    }
    return false;
  }, [editor, isLocked]);

  // Prompts for a URL; an empty URL removes the link.
  const setLink = useCallback(() => {
    if (isLocked) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor, isLocked]);

  const insertTable = useCallback(() => {
    if (isLocked) return;

    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor, isLocked]);

  return { note, setTitle, editor, isLocked, toggleLock, insertImage, setLink, insertTable };
};
