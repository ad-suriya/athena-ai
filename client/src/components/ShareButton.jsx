import React, { useState, useEffect } from 'react';
import { Share2, X } from 'lucide-react';

const ShareButton = ({ conversationId, messages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `https://chatgpt.com/share/${conversationId}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.querySelector('.share-modal-content');
      if (modal && !modal.contains(event.target) && !event.target.closest('.share-button-trigger')) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors share-button-trigger"
      >
        <Share2 className="w-5 h-5 text-gray-600" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Blur overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 z-[10000]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Share public link to chat</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your name, custom instructions, and any messages you add after sharing stay private. 
              <a href="#" className="text-blue-500 hover:underline ml-1">Learn more</a>
            </p>
            
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                readOnly
                value={`https://chatgpt.com/share/${conversationId}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Create link
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;