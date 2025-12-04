import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const ConversationSearch = ({ conversations, onSearch, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations([]);
      return;
    }

    const filtered = conversations.filter(conversation => 
      conversation.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleConversationSelect = (conversation) => {
    onSearch(conversation);
    setSearchQuery('');
    setIsSearchOpen(false);
    onClose();
  };

  return (
    <div className="relative">
      {/* Search button in sidebar */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 bg-white hover:bg-gray-100 rounded-lg mb-2 transition-colors border border-gray-200"
      >
        <Search className="w-4 h-4 text-gray-700" />
        <span className="text-gray-800">Search conversations</span>
      </button>

      {/* Search modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">Search Conversations</h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search conversation history..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {searchQuery && filteredConversations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No conversations found matching "{searchQuery}"
                </p>
              ) : (
                <ul className="space-y-1">
                  {filteredConversations.map((conversation, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleConversationSelect(conversation)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {conversation}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationSearch;