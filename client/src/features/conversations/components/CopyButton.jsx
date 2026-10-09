import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react'; // Ensure you have lucide-react installed
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleCopy = async () => {
    if (isAnimating) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsAnimating(true);
      
      setTimeout(() => {
        setCopied(true);
        
        setTimeout(() => {
          setCopied(false);
          
          setTimeout(() => {
            setIsAnimating(false);
          }, 300);
        }, 2000);
      }, 150);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setIsAnimating(false);
    }
  };
  
  return (
    <button 
      onClick={handleCopy}
      disabled={isAnimating}
      className={`p-1.5 rounded-lg transition-all duration-300 ${
        isAnimating 
          ? (copied ? 'bg-emerald-50 scale-110' : 'bg-brand-50 scale-95')
          : 'hover:bg-brand-50'
      }`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      <div className="relative flex items-center justify-center">
        <div className={`transition-all duration-300 ${
          copied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90 absolute'
        }`}>
          <Check className={`w-4 h-4 ${copied ? 'text-emerald-600' : 'text-ink-faint'}`} />
        </div>
        <div className={`transition-all duration-300 ${
          copied ? 'opacity-0 scale-50 rotate-90 absolute' : 'opacity-100 scale-100 rotate-0'
        }`}>
          <Copy className="w-4 h-4 text-ink-faint" />
        </div>
      </div>
    </button>
  );
};
export default CopyButton;