// CodeCompiler.js
import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, MessageSquare, Code, FileText, Folder, ChevronRight, ChevronDown, Search } from 'lucide-react';

const CodeCompiler = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('explorer');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I can help you with your Python code. What would you like to know?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Load code from localStorage on component mount
  useEffect(() => {
    const savedCode = localStorage.getItem('pythonCode');
    if (savedCode) {
      setCode(savedCode);
    }
  }, []);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pythonCode', code);
  }, [code]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const newUserMessage = { id: chatMessages.length + 1, sender: 'user', text: chatInput };
    setChatMessages([...chatMessages, newUserMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        id: chatMessages.length + 2, 
        sender: 'ai', 
        text: "I'm a demo AI assistant. In a real implementation, I would provide helpful responses about your code." 
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
    
    setChatInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex">
        {/* Sidebar */}
        <div className={`bg-[#2c2c2c] text-gray-200 flex flex-col ${sidebarOpen ? 'w-64' : 'w-12'} transition-width duration-200`}>
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            {sidebarOpen && <span className="text-sm font-medium">DIPLORER</span>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <ChevronRight className={`w-4 h-4 ${sidebarOpen ? 'transform rotate-180' : ''}`} />
            </button>
          </div>
          
          {sidebarOpen && (
            <>
              <div className="flex border-b border-gray-700">
                <button 
                  className={`flex-1 py-2 text-xs font-medium flex items-center justify-center ${activeTab === 'explorer' ? 'bg-[#37373d] text-white' : 'hover:bg-[#37373d]'}`}
                  onClick={() => setActiveTab('explorer')}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Explorer
                </button>
                <button 
                  className={`flex-1 py-2 text-xs font-medium flex items-center justify-center ${activeTab === 'ai' ? 'bg-[#37373d] text-white' : 'hover:bg-[#37373d]'}`}
                  onClick={() => setActiveTab('ai')}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  AI Chat
                </button>
              </div>
              
              <div className="flex-1 overflow-auto">
                {activeTab === 'explorer' ? (
                  <div className="p-2">
                    <div className="flex items-center py-1 px-2 text-xs uppercase text-gray-400">
                      <span>OPEN EDITORS</span>
                    </div>
                    <div className="py-1 px-2 text-xs text-gray-300 flex items-center">
                      <ChevronDown className="w-3 h-3 mr-1" />
                      <span>NO FOLDER OPENED</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center py-1 px-2 text-xs uppercase text-gray-400">
                        <span>OUTLINE</span>
                      </div>
                      <div className="py-1 px-2 text-xs text-gray-300">
                        No symbols found in document 'python_code.py'
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center py-1 px-2 text-xs uppercase text-gray-400">
                        <span>TIMELINE</span>
                      </div>
                      <div className="py-1 px-2 text-xs text-gray-300">
                        No recent changes
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b border-gray-700">
                      <div className="text-xs font-medium mb-2">AI Assistant</div>
                      <div className="text-xs text-gray-400">
                        Ask questions about your Python code
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-3 space-y-3">
                      {chatMessages.map(message => (
                        <div 
                          key={message.id} 
                          className={`p-2 rounded text-sm ${message.sender === 'ai' ? 'bg-[#37373d]' : 'bg-[#0f5c97]'}`}
                        >
                          {message.text}
                        </div>
                      ))}
                    </div>
                    
                    <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-700">
                      <div className="flex">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask a question..."
                          className="flex-1 bg-[#3c3c3c] text-sm py-1 px-2 rounded-l focus:outline-none"
                        />
                        <button 
                          type="submit"
                          className="bg-[#0f5c97] px-3 rounded-r text-sm hover:bg-[#138cd4]"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-[#EBEBEB]">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-900">Code Compiler</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Toolbar */}
          <div className="bg-[#f5f5f5] p-2 border-b border-gray-300 flex items-center text-xs">
            <div className="flex items-center mr-4">
              <Folder className="w-3 h-3 mr-1 text-gray-600" />
              <span className="text-gray-700">File</span>
            </div>
            <div className="flex items-center mr-4">
              <Search className="w-3 h-3 mr-1 text-gray-600" />
              <span className="text-gray-700">Search</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <SyntaxHighlighter 
                language="python" 
                style={coy}
                showLineNumbers
                wrapLines
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#f8f9fa',
                  minHeight: '300px'
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'monospace'
                  }
                }}
              >
                {code}
              </SyntaxHighlighter>
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm border-t border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Python code here..."
                style={{
                  whiteSpace: 'pre',
                  overflowWrap: 'normal',
                  overflowX: 'auto'
                }}
              />
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-300 bg-[#EBEBEB] flex justify-between items-center">
            <div className="text-xs text-gray-600">
              Code is automatically saved locally
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCode('')}
                className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-xs font-medium hover:bg-gray-300"
              >
                Clear
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCompiler;