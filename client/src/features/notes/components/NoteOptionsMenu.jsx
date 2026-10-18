import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Download, Link as LinkIcon, Lock, Maximize, Mic, Square, Trash2, Type, Undo } from 'lucide-react';
import { exportToPDF, extractEditorContent, getNoteMetadata } from '../utils/notePdfExport';
import { MenuDivider, MenuItem, MenuToggleItem } from './NoteMenuItems';
import { menuIconClass, menuItemThemeClass } from '../utils/menuStyles';

const wordCount = (editor) => (editor?.getText().trim().match(/\S+/g) || []).length;

// The note's "⋮" menu: dictation, copy link, duplicate, delete, view toggles,
// lock, undo, PDF export, and word count / last saved. Closes on outside click
// or after an action.
const NoteOptionsMenu = ({
  isDarkMode,
  editor,
  note,
  savedNote,
  onDelete,
  onDuplicate,
  dictation,
  fullWidth,
  onToggleFullWidth,
  smallText,
  onToggleSmallText,
  isLocked,
  onToggleLock,
  onExportComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Runs an action and closes the menu.
  const act = (action) => () => {
    action();
    setIsOpen(false);
  };

  const handleMoveToTrash = () => {
    setIsOpen(false);
    if (onDelete && window.confirm('Are you sure you want to delete this note?')) {
      onDelete();
    }
  };

  // Link to this entry inside Athena (opens for the signed-in owner).
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/notes?id=${encodeURIComponent(savedNote.id)}`);
      setLinkCopied(true);
      setTimeout(() => { setLinkCopied(false); setIsOpen(false); }, 900);
    } catch {
      setIsOpen(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      const content = extractEditorContent(editor);
      const metadata = getNoteMetadata(note);
      const result = await exportToPDF(content, metadata.title, metadata);

      if (result.success) {
        onExportComplete?.({ success: true, filename: result.filename, note: metadata });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export failed:', error);
      onExportComplete?.({ success: false, error: error.message });
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const itemProps = { isDarkMode };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-md transition-colors ${
          isDarkMode
            ? 'text-gray-400 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20'
            : 'text-ink-muted hover:bg-brand-50 hover:text-brand-500'
        }`}
        aria-label="More options"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full z-50 mt-1 w-64 rounded-2xl border border-line p-1.5 shadow-card ${
          isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
        }`}>
          <div className="max-h-96 overflow-y-auto">
            <button
              onClick={act(dictation.toggle)}
              className={`flex items-center w-full rounded-xl px-3 py-2 text-sm transition-colors ${
                dictation.isDictating
                  ? 'rounded-xl bg-brand-50 text-brand-600'
                  : menuItemThemeClass(isDarkMode)
              }`}
            >
              {dictation.isDictating ? (
                <Square size={16} className="mr-3 text-brand-600" />
              ) : (
                <Mic size={16} className="mr-3 text-brand-500" />
              )}
              {dictation.isDictating ? 'Stop Dictation' : 'Dictate'}
            </button>

            <MenuDivider {...itemProps} />

            {savedNote?.id && (
              <MenuItem {...itemProps} icon={LinkIcon} label={linkCopied ? 'Link copied' : 'Copy link'} onClick={handleCopyLink} />
            )}
            {onDuplicate && (
              <MenuItem {...itemProps} icon={Copy} label="Duplicate" onClick={act(onDuplicate)} />
            )}
            <MenuItem {...itemProps} icon={Trash2} label="Move to Trash" onClick={handleMoveToTrash} />

            <MenuDivider {...itemProps} />

            <MenuToggleItem {...itemProps} icon={Type} label="Small text" checked={smallText} onChange={onToggleSmallText} />
            <MenuToggleItem {...itemProps} icon={Maximize} label="Full width" checked={fullWidth} onChange={onToggleFullWidth} />

            <MenuDivider {...itemProps} />

            <MenuToggleItem {...itemProps} icon={Lock} label="Lock page" checked={isLocked} onChange={act(onToggleLock)} />


            <MenuDivider {...itemProps} />

            <MenuItem
              {...itemProps}
              icon={Undo}
              label="Undo"
              hint="Ctrl+Z"
              onClick={act(() => editor?.chain().focus().undo().run())}
            />

            <MenuDivider {...itemProps} />

            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center w-full rounded-xl px-3 py-2 text-sm transition-colors ${
                isExporting ? 'cursor-not-allowed' : menuItemThemeClass(isDarkMode)
              }`}
            >
              {isExporting ? (
                <>
                  <div className="mr-3 w-4 h-4 border-2 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
                  <span className={isDarkMode ? 'text-[#F5D9D1]' : 'text-brand-600'}>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={16} className={menuIconClass(isDarkMode)} />
                  Export as PDF
                </>
              )}
            </button>

            <MenuDivider {...itemProps} />

            <div className={`px-4 py-2.5 text-xs ${
              isDarkMode
                ? 'text-[#F5D9D1]/70'
                : 'text-ink-faint'
            }`}>
              <div className="font-medium">{wordCount(editor)} words</div>
              <div className="mt-1">
                {savedNote?.id && savedNote.updatedAt
                  ? `Last saved ${new Date(savedNote.updatedAt).toLocaleString()}`
                  : 'Not saved yet'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

NoteOptionsMenu.propTypes = {
  isDarkMode: PropTypes.bool,
  // TipTap Editor instance
  editor: PropTypes.shape({
    chain: PropTypes.func.isRequired,
    getText: PropTypes.func.isRequired,
  }),
  // Editor's working copy (used for the PDF title).
  note: PropTypes.shape({
    title: PropTypes.string,
  }),
  // The note as last saved on the server (null id = not saved yet).
  savedNote: PropTypes.shape({
    id: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  dictation: PropTypes.shape({
    isDictating: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }).isRequired,
  fullWidth: PropTypes.bool.isRequired,
  onToggleFullWidth: PropTypes.func.isRequired,
  smallText: PropTypes.bool.isRequired,
  onToggleSmallText: PropTypes.func.isRequired,
  isLocked: PropTypes.bool.isRequired,
  onToggleLock: PropTypes.func.isRequired,
  onExportComplete: PropTypes.func,
};

export default NoteOptionsMenu;
