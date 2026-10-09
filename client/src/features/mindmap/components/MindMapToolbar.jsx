import PropTypes from 'prop-types';
import { Eye, EyeOff, Plus, Sparkles, Zap } from 'lucide-react';

// Bottom-left tools (mini map toggle, placeholder, Tidy), bottom-right add button,
// and the centered usage hint.
const MindMapToolbar = ({ showMiniMap, onToggleMiniMap, onTidy, onAddNode }) => (
  <>
    <div className="absolute bottom-3 left-3 flex gap-2">
      <button
        onClick={onToggleMiniMap}
        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
      >
        {showMiniMap ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
      </button>
      <button className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
        <Zap className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onTidy}
        className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 text-sm"
      >
        <Sparkles className="w-3 h-3 text-gray-600" />
        <span className="text-xs font-medium text-gray-700">Tidy</span>
      </button>
    </div>

    <button
      onClick={onAddNode}
      className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110"
    >
      <Plus className="w-5 h-5" />
    </button>

    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs">
      💡 Double-click to create • Right-click for options
    </div>
  </>
);

MindMapToolbar.propTypes = {
  showMiniMap: PropTypes.bool.isRequired,
  onToggleMiniMap: PropTypes.func.isRequired,
  onTidy: PropTypes.func.isRequired,
  onAddNode: PropTypes.func.isRequired,
};

export default MindMapToolbar;
