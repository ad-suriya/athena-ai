import React from 'react';
import { X } from 'lucide-react';
import { categories, categoryOptions } from '../data/ChatCategoriesData.js';

const ChatCategoriesPanel = ({
  isAbsolute = false,
  selectedCategory,
  showCategoryPanel,
  handleCategoryClick,
  handleCategoryOptionSelect,
  setShowCategoryPanel,
  setSelectedCategory,
}) => {
  return (
    <>
      <div className={`flex flex-wrap justify-center gap-2 ${isAbsolute ? '' : 'mb-4'}`}>
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium border-2
                ${selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white border-transparent shadow-lg shadow-[#E65C52]/30' 
                  : 'bg-white text-gray-700 border-[#E65C52]/20 hover:bg-[#F5D9D1] hover:border-[#E65C52]/40 hover:shadow-md'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${selectedCategory === category.id ? 'text-white' : 'text-[#E65C52]'}`} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {showCategoryPanel && selectedCategory && (
        <div className={`relative w-full ${isAbsolute ? 'mt-4' : 'mb-4'}`}>
          <div 
            className={`border-2 border-[#E65C52]/20 rounded-xl shadow-xl overflow-hidden bg-white category-panel ${isAbsolute ? 'absolute left-0 right-0 mx-auto z-10' : ''}`}
            style={isAbsolute ? { width: 'calc(100% - 2rem)' } : {}}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#E65C52]/20 bg-gradient-to-r from-[#F5D9D1]/30 to-white">
              <div className="flex items-center gap-2">
                {React.createElement(categories.find((c) => c.id === selectedCategory)?.icon, { 
                  className: 'w-4 h-4 text-[#E65C52]' 
                })}
                <span className="font-medium text-[#E14C42]">
                  {categories.find((c) => c.id === selectedCategory)?.label}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCategoryPanel(false);
                  setSelectedCategory(null);
                }}
                className="text-gray-400 hover:text-[#E65C52] hover:bg-[#F5D9D1] rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-2">
              {categoryOptions[selectedCategory]?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryOptionSelect(option)}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-[#F5D9D1] transition-colors border-b border-[#E65C52]/10 last:border-b-0"
                >
                  <span className="text-sm leading-relaxed">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatCategoriesPanel;
