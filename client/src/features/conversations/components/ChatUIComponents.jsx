import React, { useState } from 'react';
import logo from '../../../assets/logo-07.png';

// Tooltip Component - Updated colors
export const Tooltip = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} z-50 px-2 py-1 text-xs text-white bg-ink rounded-md whitespace-nowrap pointer-events-none`}
        >
          {text}
          <div
            className={`absolute w-2 h-2 bg-ink transform rotate-45 ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2'
                : position === 'bottom'
                ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2'
                : position === 'left'
                ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2'
                : 'right-full top-1/2 -translate-y-1/2 translate-x-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

// AppLogo Component
export const AppLogo = ({ size = 45 }) => (
  <img src={logo} alt="Yudle Logo" width={size} height={size} />
);

// SmartActionButton Component - Updated colors
export const SmartActionButton = ({ icon, label, active, onClick, isSearch = false }) => {
  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium";

  const getButtonClasses = () => {
    if (isSearch) {
      return `${baseClasses} ${
        active 
          ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white border-2 border-transparent shadow-lg shadow-[#E65C52]/30' 
          : 'bg-white text-gray-700 border-2 border-[#E65C52]/20 hover:bg-[#F5D9D1] hover:border-[#E65C52]/40 hover:shadow-md'
      }`;
    } else if (label === 'Deep Research') {
      return `${baseClasses} ${
        active 
          ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white border-2 border-transparent shadow-lg shadow-[#E65C52]/30'
          : 'bg-white text-gray-700 border-2 border-[#E65C52]/20 hover:bg-[#F5D9D1] hover:border-[#E65C52]/40 hover:shadow-md'
      }`;
    } else {
      return `${baseClasses} ${
        active 
          ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white border-2 border-transparent shadow-lg shadow-[#E65C52]/30'
          : 'bg-white text-gray-700 border-2 border-[#E65C52]/20 hover:bg-[#F5D9D1] hover:border-[#E65C52]/40 hover:shadow-md'
      }`;
    }
  };

  const getIconClasses = () => {
    if (isSearch) {
      return `w-4 h-4 ${active ? 'text-white' : 'text-[#E65C52]'}`;
    } else if (label === 'Deep Research') {
      return `w-4 h-4 ${active ? 'text-white' : 'text-[#E65C52]'}`;
    } else {
      return `w-4 h-4 ${active ? 'text-white' : 'text-[#E65C52]'}`;
    }
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClasses()}
    >
      {React.cloneElement(icon, {
        className: getIconClasses()
      })}
      <span>{label}</span>
    </button>
  );
};
