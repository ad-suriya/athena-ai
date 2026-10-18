import React from 'react';
import CodeMethod from './CodeMethod';
import CopyButton from '../../../../../client/src/features/conversations/components/CopyButton';
import './styles.css';

const CodeContent = ({ code, language }) => {
  // Parse the code into methods if it's in the expected format
  const methods = parseCodeMethods(code, language);

  return (
    <div className="code-content-container">
      {methods.map((method, index) => (
        <CodeMethod 
          key={index}
          title={method.title}
          code={method.code}
        />
      ))}
      <div className="code-footer">
        <CopyButton text={code} />
      </div>
    </div>
  );
};

// Helper function to parse code into methods
function parseCodeMethods(code, language) {
  if (language === 'python') {
    // Python-specific parsing
    const methodRegex = /(#\s*method\s*\d+:.*?\n)(.*?)(?=#\s*method\s*\d+:|$)/gs;
    const matches = [...code.matchAll(methodRegex)];
    
    return matches.map(match => ({
      title: match[1].replace('#', '').trim(),
      code: match[2].trim()
    }));
  }
  
  // Default parsing for other languages
  return [{
    title: 'Code',
    code: code
  }];
}

export default CodeContent;