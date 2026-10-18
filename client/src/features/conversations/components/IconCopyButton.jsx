import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react'; // Ensure you have lucide-react installed
const IconCopyButton= ({ text }) => {
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
          ? (copied ? 'bg-white/25 scale-110' : 'bg-white/15 scale-95')
          : 'hover:bg-white/15'
      }`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      <div className="relative flex items-center justify-center">
        <div className={`transition-all duration-300 ${
          copied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90 absolute'
        }`}>
          <Check className={`w-4 h-4 ${copied ? 'text-white/85' : 'text-white/85'}`} />
        </div>
        <div className={`transition-all duration-300 ${
          copied ? 'opacity-0 scale-50 rotate-90 absolute' : 'opacity-100 scale-100 rotate-0'
        }`}>
          <Copy className="w-4 h-4 text-white/85" />
        </div>
      </div>
    </button>
  );
};
export default IconCopyButton;