import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './styles.css';

const CodeHeader = ({ title, language, isExpanded, onToggle }) => {
  return (
    <div className="code-header" onClick={onToggle}>
      <div className="code-title">{title}</div>
      <div className="flex items-center gap-2">
        <span className="code-language">{language}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </div>
  );
};

export default CodeHeader;