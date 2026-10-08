import React from 'react';

const MarkdownFormatter = ({ content }) => {
  if (!content) return null;

  // Split content by lines
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Handle empty lines
    if (line.trim() === '') {
      return <br key={index} />;
    }
    
    // Handle ## headings (h2)
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      return (
        <h2 
          key={index} 
          className="text-2xl font-bold dark:text-gray-100 mt-6 mb-3 leading-tight"
        >
          {line.replace('## ', '')}
        </h2>
      );
    }
    
    // Handle ### headings (h3)
    if (line.startsWith('### ')) {
      return (
        <h3 
          key={index} 
          className="text-xl font-semibold dark:text-gray-200 mt-5 mb-2 leading-snug"
        >
          {line.replace('### ', '')}
        </h3>
      );
    }
    
    // Handle **bold** text
    const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
    if (boldParts.some(part => part.startsWith('**') && part.endsWith('**'))) {
      return (
        <p key={index} className="dark:text-gray-300 mb-3 text-base leading-relaxed">
          {boldParts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={partIndex} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    }
    
    // Handle regular paragraphs
    return (
      <p key={index} className="dark:text-gray-300 mb-3 text-base leading-relaxed">
        {line}
      </p>
    );
  });
};

export default MarkdownFormatter;