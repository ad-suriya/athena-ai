import { useState } from 'react';
import { MessageSquare, Brain, Atom } from 'lucide-react';

export default function ToggleButtons({ onModeChange }) {
  const [activeButton, setActiveButton] = useState('message');

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
    if (onModeChange) {
      onModeChange(buttonId);
    }
  };

  const getButtonClasses = (buttonId) => {
    const baseClasses = "p-2 rounded-full transition-all duration-200 focus:outline-none relative group";
    const activeClasses = "bg-[#0E0E28] text-white shadow-sm";
    const inactiveClasses = "text-gray-500 hover:bg-gray-100 hover:text-gray-700";
            
    return `${baseClasses} ${activeButton === buttonId ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1">
      <button 
        type="button"
        className={getButtonClasses('message')}
        onClick={() => handleButtonClick('message')}
        aria-label="Basic Mode"
      >
        <MessageSquare className="w-4 h-4" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-medium">Basic Mode</div>
          <div className="text-xs text-gray-300 mt-0.5">Simple and direct responses</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      </button>
            
      <button 
        type="button"
        className={getButtonClasses('brain')}
        onClick={() => handleButtonClick('brain')}
        aria-label="Analytical Mode"
      >
        <Brain className="w-4 h-4" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-medium">Analytical</div>
          <div className="text-xs text-gray-300 mt-0.5">Detailed analysis and reasoning</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      </button>
            
      <button 
        type="button"
        className={getButtonClasses('atom')}
        onClick={() => handleButtonClick('atom')}
        aria-label="Complex Mode"
      >
        <Atom className="w-4 h-4" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-medium">Complex</div>
          <div className="text-xs text-gray-300 mt-0.5">Advanced problem solving</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      </button>
    </div>
  );
}