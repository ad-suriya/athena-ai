import React from 'react';
const SmartActionButton = ({ icon, label, active, onClick, isSearch = false }) => {
  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
  
  const getButtonClasses = () => {
    if (isSearch) {
      return `${baseClasses} ${
        active 
          ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-inner' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent'
      }`;
    } else if (label === 'Deep Research') {
      return `${baseClasses} ${
        active 
          ? 'bg-violet-100 text-violet-700 border border-violet-200 shadow-inner' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent'
      }`;
    } else {
      return `${baseClasses} ${
        active 
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-inner' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent'
      }`;
    }
  };

  const getIconClasses = () => {
    if (isSearch) {
      return `w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-600'}`;
    } else if (label === 'Deep Research') {
      return `w-4 h-4 ${active ? 'text-violet-600' : 'text-gray-600'}`;
    } else {
      return `w-4 h-4 ${active ? 'text-yellow-600' : 'text-gray-600'}`;
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
export default SmartActionButton;