import PropTypes from 'prop-types';

// URL field for inserting an image. The value is owned by the parent so it
// survives hiding and reopening the field.
const NoteImageInput = ({ isDarkMode, imageUrl, onImageUrlChange, onAdd, onCancel }) => {
  return (
    <div className={`px-6 mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="flex gap-2">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="Paste image URL..."
          className={`flex-1 px-3 py-2 rounded border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300'
          }`}
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Add
        </button>
        <button
          onClick={onCancel}
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
  );
};

NoteImageInput.propTypes = {
  isDarkMode: PropTypes.bool,
  imageUrl: PropTypes.string.isRequired,
  onImageUrlChange: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default NoteImageInput;
