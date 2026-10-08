// components/ConversationItem.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FileText, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const ConversationItem = ({ title, onRename, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== title) {
      onRename(title, newTitle);
    }
    setIsRenaming(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(title);
    setShowDeleteConfirm(false);
  };

  // Handle clicking outside to cancel rename or close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close menu when clicking outside
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) && 
          menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      
      // Handle rename cancel
      if (isRenaming && inputRef.current && !inputRef.current.contains(event.target)) {
        handleRename();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRenaming, showMenu]);

  return (
    <div className="group relative flex items-center justify-between gap-2 text-sm text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200">
      {isRenaming ? (
        <div className="flex items-center gap-2 w-full">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none"
            autoFocus
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">{title}</span>
          </div>
          
          {/* Three-dot menu button */}
          <button 
            ref={menuButtonRef}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div 
              ref={menuRef}
              className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg w-40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                    setTimeout(() => inputRef.current?.select(), 0);
                  }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-medium text-lg text-gray-900 mb-4">Delete Conversation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;