import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Bell, Clock, Copy, Download, Edit3, Languages, Link as LinkIcon, Lock, Maximize,
  Mic, Monitor, Move, RotateCcw, Square, Trash2, Type, Undo, Upload, Users
} from 'lucide-react';
import { exportToPDF, extractEditorContent, getNoteMetadata } from '../utils/notePdfExport';
import { MenuDivider, MenuItem, MenuToggleItem } from './NoteMenuItems';
import { menuIconClass, menuItemThemeClass } from '../utils/menuStyles';

// Items not implemented yet: they close the menu and log, as before.
const placeholder = (name) => () => console.log(name);

// The note's "⋮" menu: dictation, delete, view toggles, lock, undo, PDF export,
// and several placeholder actions. Closes on outside click or after an action.
const NoteOptionsMenu = ({
  isDarkMode,
  editor,
  note,
  onDelete,
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

  const handleExport = async () => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      const content = extractEditorContent(editor);
      const metadata = getNoteMetadata(note);
      const result = await exportToPDF(content, metadata.title, metadata);

      if (result.success) {
        onExportComplete?.({ success: true, filename: result.filename, note: metadata });
        console.log(`PDF exported successfully: ${result.filename}`);
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
            : 'text-[#E65C52] hover:text-[#E14C42] hover:bg-[#F5D9D1]'
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
        <div className={`absolute right-0 top-full mt-1 w-64 rounded-lg shadow-xl border-2 border-[#E65C52]/20 py-2 z-50 ${
          isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-white to-[#F5D9D1]/20'
        }`}>
          <div className="max-h-96 overflow-y-auto">
            <button
              onClick={act(dictation.toggle)}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                dictation.isDictating
                  ? 'text-[#E14C42] bg-gradient-to-r from-[#F5D9D1] to-[#F5D9D1]/80 border-l-2 border-[#E65C52]'
                  : menuItemThemeClass(isDarkMode)
              }`}
            >
              {dictation.isDictating ? (
                <Square size={16} className="mr-3 text-[#E14C42]" />
              ) : (
                <Mic size={16} className="mr-3 text-[#E65C52]" />
              )}
              {dictation.isDictating ? 'Stop Dictation' : 'Dictate'}
            </button>

            <MenuDivider {...itemProps} />

            <MenuItem {...itemProps} icon={LinkIcon} label="Copy link" hint="Ctrl+Alt+L" onClick={act(placeholder('Copy link'))} />
            <MenuItem {...itemProps} icon={Copy} label="Duplicate" hint="Ctrl+D" onClick={act(placeholder('Duplicate note'))} />
            <MenuItem {...itemProps} icon={Move} label="Move to" hint="Ctrl+↑+P" onClick={act(placeholder('Move to'))} />
            <MenuItem {...itemProps} icon={Trash2} label="Move to Trash" onClick={handleMoveToTrash} />

            <MenuDivider {...itemProps} />

            <MenuToggleItem {...itemProps} icon={Type} label="Small text" checked={smallText} onChange={onToggleSmallText} />
            <MenuToggleItem {...itemProps} icon={Maximize} label="Full width" checked={fullWidth} onChange={onToggleFullWidth} />
            <MenuItem {...itemProps} icon={Edit3} label="Customize page" onClick={act(placeholder('Customize page'))} />

            <MenuDivider {...itemProps} />

            <MenuToggleItem {...itemProps} icon={Lock} label="Lock page" checked={isLocked} onChange={act(onToggleLock)} />

            <MenuDivider {...itemProps} />

            <MenuItem {...itemProps} icon={Edit3} label="Suggest edits" onClick={act(placeholder('Suggest edits'))} />
            <MenuItem {...itemProps} icon={Languages} label="Translate" hasSubmenu onClick={act(placeholder('Translate'))} />

            <MenuDivider {...itemProps} />

            <MenuItem
              {...itemProps}
              icon={Undo}
              label="Undo"
              hint="Ctrl+Z"
              onClick={act(() => editor?.chain().focus().undo().run())}
            />

            <MenuDivider {...itemProps} />

            <MenuItem {...itemProps} icon={Upload} label="Import" onClick={act(placeholder('Import'))} />

            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                isExporting ? 'cursor-not-allowed' : menuItemThemeClass(isDarkMode)
              }`}
            >
              {isExporting ? (
                <>
                  <div className="mr-3 w-4 h-4 border-2 border-[#F5D9D1] border-t-[#E65C52] rounded-full animate-spin"></div>
                  <span className={isDarkMode ? 'text-[#F5D9D1]' : 'text-[#E14C42]'}>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={16} className={menuIconClass(isDarkMode)} />
                  Export as PDF
                </>
              )}
            </button>

            <MenuDivider {...itemProps} />

            <MenuItem {...itemProps} icon={RotateCcw} label="Turn into wiki" onClick={act(placeholder('Turn into wiki'))} />

            <MenuDivider {...itemProps} />

            <MenuItem {...itemProps} icon={Clock} label="Updates & analytics" onClick={act(placeholder('Updates & analytics'))} />
            <MenuItem {...itemProps} icon={Clock} label="Version history" onClick={act(placeholder('Version history'))} />

            <MenuDivider {...itemProps} />

            <MenuItem {...itemProps} icon={Bell} label="Notify me" hasSubmenu submenuLabel="Comments" onClick={act(placeholder('Notify me'))} />
            <MenuItem {...itemProps} icon={Users} label="Connections" hasSubmenu submenuLabel="None" onClick={act(placeholder('Connections'))} />

            <MenuDivider {...itemProps} />

            <MenuItem {...itemProps} icon={Monitor} label="Open in Windows app" onClick={act(placeholder('Open in Windows app'))} />

            <MenuDivider {...itemProps} />

            <div className={`px-4 py-2.5 text-xs ${
              isDarkMode
                ? 'text-[#F5D9D1]/70'
                : 'text-[#E65C52]'
            }`}>
              <div className="font-medium">Word count: {note?.wordCount || 0} words</div>
              <div className="mt-1">Last edited by {note?.author || 'Unknown'}</div>
              <div className="text-[10px] opacity-75">
                {note?.lastEdited ? new Date(note.lastEdited).toLocaleString() : new Date().toLocaleString()}
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
  note: PropTypes.shape({
    title: PropTypes.string,
    author: PropTypes.string,
    lastEdited: PropTypes.string,
    wordCount: PropTypes.number,
  }),
  onDelete: PropTypes.func,
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
