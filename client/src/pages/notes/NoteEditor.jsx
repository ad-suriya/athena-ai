import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code,
  Link2 as LinkIcon,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code as CodeBlockIcon,
  Minus,
  Palette,
  Highlighter,
  Mic,
  Square,
  Lock,
  Unlock
} from 'lucide-react';

// Import the DropdownMenu component
import DropdownMenu from './DropdownMenu';

// Simple red recording button component
const RecordingButton = ({ isRecording, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        isRecording 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {isRecording ? (
        <>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span>Stop</span>
        </>
      ) : (
        <>
          
        </>
      )}
    </button>
  );
};

const NoteEditor = ({ isDarkMode = false, onNavigateBack, initialNote, onSave }) => {
  const [note, setNote] = useState(
    initialNote || {
      id: Date.now(),
      title: 'New Page',
      content: '',
      category: 'Personal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [smallText, setSmallText] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center','justify'],
        defaultAlignment: 'left',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: note.content,
    editable: !isLocked, // Make editor editable based on lock state
    onUpdate: ({ editor }) => {
      if (isLocked) return; // Don't update content if locked
      
      const html = editor.getHTML();
      setNote(prev => ({
        ...prev,
        content: html,
        updatedAt: new Date().toISOString()
      }));
    },
  });

  useEffect(() => {
    if (editor && initialNote?.content) {
      editor.commands.setContent(initialNote.content);
    }
  }, [editor, initialNote]);

  // Update editor editable state when lock changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [isLocked, editor]);

  const addImage = useCallback(() => {
    if (imageUrl && !isLocked) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  }, [imageUrl, editor, isLocked]);

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

  const addTable = useCallback(() => {
    if (isLocked) return;
    
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor, isLocked]);

  const handleSave = () => {
    setIsSaving(true);
    if (onSave) {
      onSave(note);
    }
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.history.back();
    }
  };

  const handleToggleFullWidth = () => {
    setFullWidth(!fullWidth);
  };

  const handleToggleSmallText = () => {
    setSmallText(!smallText);
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (!editor) {
    return <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>Loading editor...</div>;
  }

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className={`p-2 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M12.8 7.2H5.6l2.8-2.8L7.2 3.2 2.4 8l4.8 4.8 1.2-1.2-2.8-2.8h7.2V7.2z"/>
            </svg>
          </button>
          <button 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().chain().focus().undo().run() || isLocked}
            className={`p-2 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors disabled:opacity-50`}
          >
            <Undo2 size={18} />
          </button>
          <button 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().chain().focus().redo().run() || isLocked}
            className={`p-2 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors disabled:opacity-50`}
          >
            <Redo2 size={18} />
          </button>
        </div>
        
        {/* Header buttons section */}
        <div className="flex items-center gap-4">
          {isDictating ? (
            <RecordingButton 
              isRecording={true} 
              onClick={() => setIsDictating(false)}
            />
          ) : (
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isSaving ? 'Saving...' : `Edited by sree anirudhan • ${formatDate(note.updatedAt)}`}
            </span>
          )}
          
          <button 
            onClick={handleSave}
            disabled={isLocked}
            className={`px-3 py-1 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors disabled:opacity-50`}
          >
            Save
          </button>
          
          {/* Lock/Unlock button 
          <button
            onClick={handleToggleLock}
            className={`p-2 rounded-md transition-colors ${
              isLocked 
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                : isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title={isLocked ? "Unlock page" : "Lock page"}
          >
            {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
          </button>*/}
          
          <DropdownMenu 
            isDarkMode={isDarkMode} 
            editor={editor}
            onNavigateBack={onNavigateBack}
            onSave={onSave}
            note={note}
            onDictationStateChange={(dictating) => setIsDictating(dictating)}
            onToggleFullWidth={handleToggleFullWidth}
            onToggleSmallText={handleToggleSmallText}
            fullWidth={fullWidth}
            smallText={smallText}
            isLocked={isLocked}
            onToggleLock={handleToggleLock}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className={`h-full py-6 ${fullWidth ? '' : 'max-w-3xl mx-auto'}`}>
          {/* Page Title */}
          <div className="px-6 mb-4">
            <input
              type="text"
              value={note.title}
              onChange={(e) => {
                if (isLocked) return;
                setNote(prev => ({
                  ...prev,
                  title: e.target.value,
                  updatedAt: new Date().toISOString()
                }))
              }}
              readOnly={isLocked}
              className={`${smallText ? 'text-2xl' : 'text-4xl'} font-bold bg-transparent border-none outline-none w-full placeholder-gray-400 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
              placeholder="New Page"
            />
          </div>
          
          {/* Show image input when toggled */}
          {showImageInput && !isLocked && (
            <div className={`px-6 mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className={`flex-1 px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={addImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowImageInput(false)}
                  className={`px-4 py-2 rounded transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Rich Text Editor */}
          <div className="px-6">
            {isLocked ? (
              // Show read-only content when locked
              <div 
                className={`min-h-[500px] outline-none prose ${isDarkMode ? 'prose-invert' : ''} ${isLocked ? 'cursor-not-allowed opacity-90' : ''}`}
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            ) : (
              // Show editable editor when unlocked
              <EditorContent
                editor={editor}
                className={`min-h-[500px] outline-none`}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Bubble Menu with all formatting options */}
      {editor && !isLocked && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ 
            duration: 100,
            placement: 'top',
            maxWidth: 'none'
          }}
          className={`flex flex-wrap items-center rounded-lg shadow-lg border p-2 gap-1 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Text style dropdown */}
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            className={`px-2 py-1 rounded text-sm border-none ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} cursor-pointer outline-none`}
            value={
              editor.isActive('heading', { level: 1 }) ? 1 :
              editor.isActive('heading', { level: 2 }) ? 2 :
              editor.isActive('heading', { level: 3 }) ? 3 : 0
            }
          >
            <option value={0}>Paragraph</option>
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>
          
          <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          
          {/* Text formatting buttons */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('bold')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('italic')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('underline')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Underline"
          >
            <span className="underline text-sm font-medium">U</span>
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('strike')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('code')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Code"
          >
            <Code size={16} />
          </button>
          
          <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          
          {/* Text alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
          
          <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          
          {/* Lists and blocks */}
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={`p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400`}
            title="Divider"
          >
            <Minus size={16} />
          </button>
          
          <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          
          {/* Insert options */}
          <button
            onClick={setLink}
            className={`p-2 rounded transition-colors ${
              editor.isActive('link')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Link"
            disabled={isLocked}
          >
            <LinkIcon size={16} />
          </button>
          
          <button
            onClick={() => setShowImageInput(!showImageInput)}
            className={`p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400`}
            title="Insert Image"
            disabled={isLocked}
          >
            <ImageIcon size={16} />
          </button>
          
          <button
            onClick={addTable}
            className={`p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400`}
            title="Insert Table"
            disabled={isLocked}
          >
            <TableIcon size={16} />
          </button>
        </BubbleMenu>
      )}
      
      {/* Global Styles */}
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 500px;
          font-size: ${smallText ? '14px' : '16px'};
          line-height: 1.7;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror p {
          margin: 0.75rem 0;
        }
        
        .ProseMirror h1 {
          font-size: ${smallText ? '2rem' : '2.5rem'};
          font-weight: 700;
          margin: 2rem 0 1rem 0;
          line-height: 1.2;
        }
        
        .ProseMirror h2 {
          font-size: ${smallText ? '1.5rem' : '1.875rem'};
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
          line-height: 1.3;
        }
        
        .ProseMirror h3 {
          font-size: ${smallText ? '1.25rem' : '1.5rem'};
          font-weight: 600;
          margin: 1.25rem 0 0.5rem 0;
          line-height: 1.4;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }
        
        .ProseMirror code {
          background-color: ${isDarkMode ? '#374151' : '#f3f4f6'};
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Monaco', 'Consolas', monospace;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
        }
        
        .ProseMirror th, .ProseMirror td {
          border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
          padding: 0.75rem;
          text-align: left;
        }
        
        .ProseMirror th {
          background-color: ${isDarkMode ? '#374151' : '#f9fafb'};
          font-weight: 600;
        }
        
        /* Empty state placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "Start writing...";
          color: ${isDarkMode ? '#6b7280' : '#9ca3af'};
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        /* Prose class for read-only content */
        .prose {
          max-width: none;
          color: inherit;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          line-height: 1.25;
        }
        
        .prose p {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .prose ul, .prose ol {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        
        .prose blockquote {
          border-left: 3px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
        
        .prose-invert {
          color: white;
        }
        
        .prose-invert blockquote {
          border-left-color: #4b5563;
        }
      `}</style>
    </div>
  );
};
 
export default NoteEditor;