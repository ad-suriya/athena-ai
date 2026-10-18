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
      {/* Under a conversation on phones: one row that scrolls sideways, so the chips
          don't push the messages off screen. */}
      <div className={`flex gap-2 ${isAbsolute ? 'flex-wrap justify-center' : '-mx-4 mb-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0'}`}>
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors
                ${selectedCategory === category.id
                  ? 'border-brand-100 bg-brand-100 font-medium text-brand-600'
                  : 'border-line bg-white text-ink hover:bg-brand-50'
                }
              `}
            >
              <Icon className="h-4 w-4 text-brand-500" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {showCategoryPanel && selectedCategory && (
        <div className={`relative w-full ${isAbsolute ? 'mt-4' : 'mb-4'}`}>
          <div 
            className={`overflow-hidden rounded-2xl border border-line bg-white text-left shadow-card category-panel ${isAbsolute ? 'absolute left-0 right-0 mx-auto z-10' : ''}`}
            style={isAbsolute ? { width: 'calc(100% - 2rem)' } : {}}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                {React.createElement(categories.find((c) => c.id === selectedCategory)?.icon, { 
                  className: 'h-4 w-4 text-brand-500' 
                })}
                <span className="font-semibold text-ink">
                  {categories.find((c) => c.id === selectedCategory)?.label}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCategoryPanel(false);
                  setSelectedCategory(null);
                }}
                className="rounded-full p-1 text-ink-faint transition-colors hover:bg-brand-50 hover:text-brand-500"
                aria-label="Close options"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-2">
              {categoryOptions[selectedCategory]?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryOptionSelect(option)}
                  className="w-full border-b border-line px-4 py-3 text-left text-ink transition-colors last:border-b-0 hover:bg-brand-50"
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
