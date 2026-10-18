import React from 'react';
import './styles.css';

const CodeMethod = ({ title, code }) => {
  return (
    <div className="code-method">
      <h4 className="code-method-title">{title}</h4>
      <pre className="code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeMethod;