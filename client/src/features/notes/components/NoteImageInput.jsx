import PropTypes from 'prop-types';

// URL field for inserting an image. The value is owned by the parent so it
// survives hiding and reopening the field.
const NoteImageInput = ({ isDarkMode, imageUrl, onImageUrlChange, onAdd, onCancel }) => {
  return (
    <div className={`mx-6 mb-4 rounded-2xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-line bg-[#FBF8F7]'}`}>
      <div className="flex gap-2">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="Paste image URL..."
          className={`flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-line'
          }`}
        />
        <button
          onClick={onAdd}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className={`rounded-xl px-4 py-2 text-sm transition-colors ${
            isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-white text-ink border border-line hover:bg-brand-50'
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
