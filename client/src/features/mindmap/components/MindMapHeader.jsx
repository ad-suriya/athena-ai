import { Share } from 'lucide-react';

// Title bar with (placeholder) collaborators and Share button.
const MindMapHeader = () => (
  <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center justify-between text-sm">
    <div className="flex items-center gap-3">
      <div className="font-medium text-gray-900 text-sm">🧠 Sai&apos;s Mind</div>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex -space-x-1">
        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full border border-white"></div>
        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border border-white"></div>
        <div className="w-6 h-6 bg-gray-200 rounded-full border border-white flex items-center justify-center text-xs">+3</div>
      </div>
      <button className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
        <Share size={12} />
        Share
      </button>
    </div>
  </div>
);

export default MindMapHeader;
