import React from 'react';
import { ChevronDown } from 'lucide-react';
const ModelDropdown = ({ selectedModel, setSelectedModel, showModelDropdown, setShowModelDropdown }) => {
  return (
    <div className="relative">
      <div 
        className="flex items-center gap-1 text-sm text-orange-500 cursor-pointer"
        onClick={() => setShowModelDropdown(!showModelDropdown)}
      >
        <span>{selectedModel}</span>
        <ChevronDown className="w-4 h-4" />
      </div>
      {showModelDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-32">
          {['GPT', 'Gemini', 'minerva '].map((model) => (
            <div
              key={model}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                selectedModel === model ? 'bg-gray-100 text-orange-500' : 'text-gray-700'
              }`}
              onClick={() => {
                setSelectedModel(model);
                setShowModelDropdown(false);
              }}
            >
              {model}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ModelDropdown;