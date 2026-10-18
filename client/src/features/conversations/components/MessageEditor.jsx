import { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';

const MessageEditor = ({ content, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(content);
  
  const handleSave = () => {
    onSave(editedContent);
  };
  
  return (
    <div className="mt-3 border-t border-gray-700 pt-3 bg-[#1A1A1A]">
      <div className="mb-2">
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1A1A1A] text-white placeholder-gray-400"
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
};

export default MessageEditor;