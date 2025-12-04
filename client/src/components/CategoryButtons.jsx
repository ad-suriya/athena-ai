import React, { useState } from 'react';
import { Pencil, GraduationCap, Code, Coffee, Lightbulb, X } from 'lucide-react';

export default function CategoryButtons({ onOptionSelect }) {
  const [selected, setSelected] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  const categories = [
    { id: 'write', label: 'Write', icon: Pencil },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'lifestuff', label: 'Life stuff', icon: Coffee },
    { id: 'choice', label: "Yudle's choice", icon: Lightbulb },
  ];

  const writeOptions = [
    'Create presentation scripts',
    'Help me identify my writing weaknesses',
    'Help me develop a unique voice for an audience',
    'Write case studies',
    'Compare my writing style to famous authors',
  ];

  const learnOptions = [
    'Explain a complex concept',
    'Create study materials',
    'Practice questions and quizzes',
    'Summarize research papers',
    'Learning roadmap planning',
  ];

  const codeOptions = [
    'Debug my code',
    'Write new functions',
    'Code review and optimization',
    'API integration help',
    'Database design assistance',
  ];

  const lifeOptions = [
    'Plan my weekly schedule',
    'Recipe suggestions',
    'Travel itinerary planning',
    'Email drafting help',
    'Decision making guidance',
  ];

  const choiceOptions = [
    'Suggest what I might need help with',
    'Random creative challenge',
    'Quick productivity tip',
    'Interesting fact or insight',
    'Problem-solving exercise',
  ];

  const getOptions = (categoryId) => {
    switch (categoryId) {
      case 'write':
        return writeOptions;
      case 'learn':
        return learnOptions;
      case 'code':
        return codeOptions;
      case 'lifestuff':
        return lifeOptions;
      case 'choice':
        return choiceOptions;
      default:
        return [];
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelected(categoryId);
    setShowPanel(true);
  };

  const generateMessage = (option) => {
    return `
Hi Yudle! Could you ${option.toLowerCase()}? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to — like Google Drive, web search, etc. — if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief, and conversational.

Please execute the task as soon as you can - an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
    `.trim();
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-2 p-6 justify-center">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium border-2
                ${selected === category.id 
                  ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white border-transparent shadow-lg shadow-[#E65C52]/30' 
                  : 'bg-white text-gray-700 border-[#E65C52]/20 hover:bg-[#F5D9D1] hover:border-[#E65C52]/40'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${selected === category.id ? 'text-white' : 'text-[#E65C52]'}`} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {showPanel && selected && (
        <div className="absolute top-full left-6 right-6 mt-1 border-2 border-[#E65C52]/20 rounded-xl shadow-xl z-10 overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#E65C52]/20 bg-gradient-to-r from-[#F5D9D1]/50 to-white">
            <div className="flex items-center gap-2">
              {React.createElement(categories.find((c) => c.id === selected)?.icon, { className: 'w-4 h-4 text-[#E65C52]' })}
              <span className="font-medium text-[#E14C42]">
                {categories.find((c) => c.id === selected)?.label}
              </span>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-[#E65C52] hover:bg-[#F5D9D1] rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="py-2">
            {getOptions(selected).map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  const message = generateMessage(option);
                  onOptionSelect?.(message);
                  setShowPanel(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-[#F5D9D1] transition-colors border-b border-[#E65C52]/10 last:border-b-0"
              >
                <span className="text-sm leading-relaxed">{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

}