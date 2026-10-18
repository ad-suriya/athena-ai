import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { Home, Save, Play, Download, File, MessageSquare, Send, X, Plus, Trash2 } from 'lucide-react';

const CodeEditor = () => {
  const navigate = useNavigate(); // Add this hook
  const [code, setCode] = useState('# Welcome to Python Code Editor\nprint("Hello, World!")');
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('untitled.py');
  const [isSaved, setIsSaved] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'ai', content: 'Hello! I\'m here to help you with your Python code. Ask me anything about programming!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [activeFileId, setActiveFileId] = useState(null);
  const editorRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // Load saved files on component mount
  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = () => {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('python_code_')) {
        const name = key.replace('python_code_', '');
        const content = localStorage.getItem(key);
        files.push({
          id: key,
          name: name,
          content: content,
          lastModified: new Date().toLocaleDateString()
        });
      }
    }
    setSavedFiles(files);
  };

  const handleSave = () => {
    try {
      const fileKey = `python_code_${fileName}`;
      localStorage.setItem(fileKey, code);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      loadSavedFiles();
      setActiveFileId(fileKey);
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  const handleRun = () => {
    setOutput('Running Python code...\nHello, World!\nExecution completed.');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    setIsSaved(false);
  };

  const openFile = (file) => {
    setCode(file.content);
    setFileName(file.name);
    setActiveFileId(file.id);
    setIsSaved(false);
  };

  const deleteFile = (e, fileId) => {
    e.stopPropagation();
    localStorage.removeItem(fileId);
    loadSavedFiles();
    if (activeFileId === fileId) {
      setActiveFileId(null);
    }
  };

  const createNewFile = () => {
    setCode('# New Python file\nprint("Hello, World!")');
    setFileName('untitled.py');
    setActiveFileId(null);
    setIsSaved(false);
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: chatInput
      };
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I can help you with that! Here are some suggestions for your Python code...`
      };

      setChatMessages(prev => [...prev, userMessage, aiResponse]);
      setChatInput('');
      
      // Scroll to bottom of chat
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Add this function for home navigation
  const handleHomeNavigation = () => {
    navigate('/chat'); // Navigate to chat page
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#ffffff', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 24px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}
          onMouseOver={(e) => e.target.style.background = '#0052a3'}
          onMouseOut={(e) => e.target.style.background = '#0066cc'}
          onClick={handleHomeNavigation} // Add onClick handler
        >
          <Home size={16} />
          Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
            style={{
              padding: '8px 12px',
              background: 'white',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              color: '#495057',
              minWidth: '200px',
              fontSize: '14px'
            }}
            placeholder="Enter file name"
          />
          <button 
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: isSaved ? '#28a745' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Save size={16} />
            {isSaved ? 'Saved!' : 'Save'}
          </button>
          <button 
            onClick={handleRun}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Play size={16} />
            Run
          </button>
          <button 
            onClick={handleDownload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Saved Files */}
        <div style={{ 
          width: '280px', 
          backgroundColor: '#f8f9fa', 
          borderRight: '1px solid #e9ecef',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '16px 20px', 
            backgroundColor: '#ffffff', 
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#495057' }}>
              Saved Files
            </h3>
            <button
              onClick={createNewFile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <Plus size={14} />
              New
            </button>
          </div>
          <div style={{ 
            flex: 1, 
            padding: '8px', 
            overflowY: 'auto'
          }}>
            {savedFiles.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#6c757d',
                fontSize: '14px'
              }}>
                No saved files yet
              </div>
            ) : (
              savedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => openFile(file)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    margin: '4px 0',
                    background: activeFileId === file.id ? '#e3f2fd' : 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => {
                    if (activeFileId !== file.id) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeFileId !== file.id) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <File size={16} color="#495057" />
                    <div>
                      <div style={{ fontWeight: '500', color: '#495057' }}>{file.name}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>{file.lastModified}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteFile(e, file.id)}
                    style={{
                      padding: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#dc3545',
                      borderRadius: '4px'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8d7da'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center - Code Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            padding: '12px 20px', 
            backgroundColor: '#ffffff', 
            borderBottom: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#495057' }}>
              Python Editor
            </h3>
          </div>
          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your Python code here..."
            spellCheck="false"
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: '#ffffff',
              border: 'none',
              color: '#495057',
              fontFamily: '"Fira Code", Monaco, "Cascadia Code", "Roboto Mono", monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'none',
              outline: 'none'
            }}
          />
          
          {/* Output Panel */}
          <div style={{ 
            height: '200px', 
            backgroundColor: '#f8f9fa', 
            borderTop: '1px solid #e9ecef'
          }}>
            <div style={{ 
              padding: '12px 20px', 
              backgroundColor: '#ffffff', 
              borderBottom: '1px solid #e9ecef'
            }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                Output
              </h3>
            </div>
            <pre style={{
              padding: '20px',
              margin: 0,
              fontFamily: '"Fira Code", Monaco, "Cascadia Code", "Roboto Mono", monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              overflowY: 'auto',
              height: 'calc(200px - 53px)',
              color: '#495057',
              backgroundColor: '#ffffff'
            }}>
              {output || 'Output will appear here after running your code...'}
            </pre>
          </div>
        </div>

        {/* Right Sidebar - AI Chat */}
        <div style={{ 
          width: '350px', 
          backgroundColor: '#ffffff', 
          borderLeft: '1px solid #e9ecef',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '16px 20px', 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageSquare size={18} color="#495057" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#495057' }}>
              AI Assistant
            </h3>
          </div>
          
          <div 
            ref={chatMessagesRef}
            style={{ 
              flex: 1, 
              padding: '16px', 
              overflowY: 'auto',
              backgroundColor: '#ffffff'
            }}
          >
            {chatMessages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    backgroundColor: message.type === 'user' ? '#0066cc' : '#f8f9fa',
                    color: message.type === 'user' ? 'white' : '#495057',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f8f9fa', 
            borderTop: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Python..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  color: '#495057',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={sendMessage}
                style={{
                  padding: '10px 16px',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;