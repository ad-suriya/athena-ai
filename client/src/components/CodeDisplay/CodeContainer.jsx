import React, { useState } from 'react';
import CodeHeader from './CodeHeader';
import CodeContent from './CodeContent';
import './styles.css';

const CodeContainer = ({ language, title, code }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`code-container ${isExpanded ? 'expanded' : ''}`}>
      <CodeHeader 
        title={title} 
        language={language} 
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded && <CodeContent code={code} language={language} />}
    </div>
  );
};

export default CodeContainer;