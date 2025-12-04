import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Bell, Users, Plus, Zap, Sparkles, Edit3, Trash2, Link, Eye, EyeOff, MessageCircle, Heart, Share, Copy, Menu } from 'lucide-react';
import SideBar from './SideBar';

const MindMapInterface = () => {
  const [nodes, setNodes] = useState([
    {
      id: 1,
      x: 250,
      y: 120,
      title: "What is Mental Clarity Map?",
content: "A Mental Clarity Map is a simple tool that helps someone who feels overwhelmed, stressed, or emotionally stuck. By laying out their thoughts, feelings, and possible solutions visually, it guides the person to understand what’s really happening and discover clear stepsto improve their mental well-being.",

      tags: ["telegram", "article"],
      type: "main",
      expanded: true,
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      x: 80,
      y: 240,
      title: "Mind Visualization",
      content: "Mind Visualization involves the practice of using one's imagination...",
      tags: ["telegram", "article"],
      type: "secondary",
      expanded: true,
      likes: 8,
      comments: 1
    },
    {
      id: 3,
      x: 80,
      y: 360,
      title: "3 types of Mind Models",
      content: "The three types of Mind Models include the computational mind model...",
      tags: ["telegram", "article"],
      type: "secondary",
      expanded: true,
      likes: 5,
      comments: 0
    },
    {
      id: 4,
      x: 420,
      y: 180,
      title: "Mental health Awareness",
      content: "notion",
      tags: ["notion"],
      type: "note",
      expanded: false,
      likes: 2,
      comments: 0
    },
    {
      id: 5,
      x: 420,
      y: 300,
      title: "",
      content: "Our AI uses cluster analysis to find patterns in mental-health data and offer supportive well-being insights. It’s not a substitute for professional care",
      tags: ["obsidian", "article"],
      type: "ai",
      expanded: true,
      likes: 15,
      comments: 7
    }
  ]);

  const [connections, setConnections] = useState([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 1, to: 4 },
    { from: 1, to: 5 }
  ]);

  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, nodeId: null });
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const canvasRef = useRef(null);
  const editInputRef = useRef(null);

  // Enhanced drag functionality
  const handleMouseDown = useCallback((e, nodeId) => {
    if (e.target.closest('.node-controls')) return;
    
    const node = nodes.find(n => n.id === nodeId);
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
    e.preventDefault();
  }, [nodes]);

  const handleMouseMove = useCallback((e) => {
    if (draggedNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - dragOffset.x) / (zoom / 100);
      const newY = (e.clientY - rect.top - dragOffset.y) / (zoom / 100);
      
      setNodes(prev => prev.map(node => 
        node.id === draggedNode 
          ? { ...node, x: newX, y: newY }
          : node
      ));
    }
  }, [draggedNode, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    if (draggedNode) {
      addNotification(`Node "${nodes.find(n => n.id === draggedNode)?.title}" moved`);
    }
    setDraggedNode(null);
  }, [draggedNode, nodes]);

  // Context menu
  const handleRightClick = useCallback((e, nodeId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodeId
    });
  }, []);

  // Add notification system
  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Node editing
  const startEditing = (nodeId) => {
    setEditingNode(nodeId);
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const saveEdit = (nodeId, newTitle) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, title: newTitle } : node
    ));
    setEditingNode(null);
    addNotification('Node updated');
  };

  // Node operations
  const toggleExpand = (nodeId) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, expanded: !node.expanded } : node
    ));
  };

  const duplicateNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    const newNode = {
      ...node,
      id: Math.max(...nodes.map(n => n.id)) + 1,
      x: node.x + 30,
      y: node.y + 30,
      title: `${node.title} (Copy)`
    };
    setNodes(prev => [...prev, newNode]);
    addNotification('Node duplicated');
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    addNotification('Node deleted');
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  };

  const likeNode = (nodeId) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, likes: node.likes + 1 } : node
    ));
    addNotification('❤️ Liked!');
  };

  // Connection creation
  const startConnection = (nodeId) => {
    setConnectingFrom(nodeId);
    addNotification('Click another node to create connection');
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  };

  const completeConnection = (toNodeId) => {
    if (connectingFrom && connectingFrom !== toNodeId) {
      const newConnection = { from: connectingFrom, to: toNodeId };
      setConnections(prev => [...prev, newConnection]);
      addNotification('Connection created');
    }
    setConnectingFrom(null);
  };

  // Add new node
  const addNewNode = (x, y) => {
    const newNode = {
      id: Math.max(...nodes.map(n => n.id)) + 1,
      x: x - 90,
      y: y - 40,
      title: "New Idea",
      content: "Click to edit this node...",
      tags: ["new"],
      type: "secondary",
      expanded: true,
      likes: 0,
      comments: 0
    };
    setNodes(prev => [...prev, newNode]);
    startEditing(newNode.id);
    addNotification('New node created');
  };

  // Auto-arrange nodes
  const tidyUp = () => {
    setNodes(prev => prev.map((node, index) => ({
      ...node,
      x: 100 + (index % 3) * 200,
      y: 100 + Math.floor(index / 3) * 150
    })));
    addNotification('Nodes arranged');
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [handleMouseMove, handleMouseUp]);

  const getNodeStyle = (type, isSelected, isConnecting) => {
    let base = 'transition-all duration-200 hover:scale-105';
    
    if (isSelected) base += ' ring-2 ring-blue-400 shadow-lg';
    if (isConnecting) base += ' ring-2 ring-green-400 shadow-lg animate-pulse';
    
    switch (type) {
      case 'main':
        return `${base} bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-md`;
      case 'secondary':
        return `${base} bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 shadow-sm`;
      case 'note':
        return `${base} bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 shadow-sm`;
      case 'ai':
        return `${base} bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 shadow-sm`;
      default:
        return `${base} bg-white border border-gray-200 shadow-sm`;
    }
  };

  const getTagColor = (tag) => {
    const colors = {
      telegram: 'bg-blue-100 text-blue-700',
      article: 'bg-green-100 text-green-700',
      notion: 'bg-gray-100 text-gray-700',
      obsidian: 'bg-purple-100 text-purple-700',
      new: 'bg-orange-100 text-orange-700'
    };
    return colors[tag] || 'bg-gray-100 text-gray-700';
  };

    return (
    <div className="h-screen bg-[#FCF4F1] flex relative overflow-hidden">
      {/* Sidebar */}
      <SideBar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        nodes={nodes}
        onNodeSelect={(nodeId) => {
          setSelectedNode(nodeId);
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            // Center the selected node in view
            setViewPosition({ x: -node.x + 200, y: -node.y + 150 });
          }
          setSidebarOpen(false);
        }}
        onNodeUpdate={(nodeId, updates) => {
          setNodes(prev => prev.map(node => 
            node.id === nodeId ? { ...node, ...updates } : node
          ));
        }}
      />
      {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#FCF4F1]">
        {/* Notifications */}
        <div className="fixed top-16 right-4 z-50 space-y-1">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-white border border-gray-200 rounded-md shadow-md px-3 py-1 text-xs animate-fade-in">
              {notif.message}
            </div>
          ))}
        </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-36 text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => startEditing(contextMenu.nodeId)} className="w-full px-3 py-1 text-left hover:bg-gray-50 flex items-center gap-2">
            <Edit3 size={12} /> Edit
          </button>
          <button onClick={() => duplicateNode(contextMenu.nodeId)} className="w-full px-3 py-1 text-left hover:bg-gray-50 flex items-center gap-2">
            <Copy size={12} /> Duplicate
          </button>
          <button onClick={() => startConnection(contextMenu.nodeId)} className="w-full px-3 py-1 text-left hover:bg-gray-50 flex items-center gap-2">
            <Link size={12} /> Connect
          </button>
          <hr className="my-1" />
          <button onClick={() => deleteNode(contextMenu.nodeId)} className="w-full px-3 py-1 text-left hover:bg-red-50 text-red-600 flex items-center gap-2">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}

       

            {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="font-medium text-gray-900 text-sm">🧠 Sai's Mind</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full border border-white"></div>
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border border-white"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full border border-white flex items-center justify-center text-xs">+3</div>
          </div>
          <button className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
            <Share size={12} />
            Share
          </button>
        </div>
      </div>

        {/* Main Canvas Area */}
                <div className="flex-1 relative overflow-hidden bg-[#FCF4F1]">
        {/* Mini Map */}
        {showMiniMap && (
          <div className="absolute top-2 left-2 z-10 bg-white rounded shadow-md p-1.5 w-32 h-20 border text-xs">
            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
              Map
              <button onClick={() => setShowMiniMap(false)}>
                <EyeOff size={10} />
              </button>
            </div>
            <div className="w-full h-12 bg-gray-50 rounded relative overflow-hidden">
              {nodes.map(node => (
                <div
                  key={node.id}
                  className="absolute w-1.5 h-1.5 bg-blue-400 rounded-sm"
                  style={{ 
                    left: (node.x / 15), 
                    top: (node.y / 15) 
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 z-10 bg-white rounded shadow-md px-2 py-1 flex items-center gap-1 text-sm">
          <button 
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-xs"
          >
            −
          </button>
          <span className="text-xs font-medium min-w-8 text-center">{zoom}%</span>
          <button 
            onClick={() => setZoom(Math.min(150, zoom + 25))}
            className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-xs"
          >
            +
          </button>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          onDoubleClick={(e) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / (zoom / 100);
            const y = (e.clientY - rect.top) / (zoom / 100);
            addNewNode(x, y);
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" 
                      refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
            </defs>
            {connections.map((conn, index) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              const fromX = fromNode.x + 90;
              const fromY = fromNode.y + 40;
              const toX = toNode.x + 90;
              const toY = toNode.y + 40;
              
              const midX = (fromX + toX) / 2;
              const midY = (fromY + toY) / 2;
              const offset = 30;
              
              return (
                <g key={index}>
                  <path
                    d={`M ${fromX} ${fromY} Q ${midX + offset} ${midY} ${toX} ${toY}`}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray={conn.from === 1 && conn.to === 5 ? "3,3" : "none"}
                    markerEnd="url(#arrowhead)"
                    className="hover:stroke-blue-400 cursor-pointer"
                  />
                </g>
              );
            })}
            
            {/* Connection preview */}
            {connectingFrom && (
              <circle cx={nodes.find(n => n.id === connectingFrom)?.x + 90} 
                      cy={nodes.find(n => n.id === connectingFrom)?.y + 40} 
                      r="3" fill="#10b981" className="animate-ping" />
            )}
          </svg>

          {/* Compact Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-48 rounded-lg p-3 cursor-move select-none ${getNodeStyle(
                node.type, 
                selectedNode === node.id, 
                connectingFrom === node.id
              )}`}
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onContextMenu={(e) => handleRightClick(e, node.id)}
              onClick={() => {
                if (connectingFrom && connectingFrom !== node.id) {
                  completeConnection(node.id);
                } else {
                  setSelectedNode(node.id);
                }
              }}
            >
              {/* Node Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-1">
                  {node.type === 'ai' && <span className="text-sm">🤖</span>}
                  {node.type === 'note' && <span className="text-sm">📝</span>}
                  {node.type === 'secondary' && <span className="text-sm">🧠</span>}
                  {node.type === 'main' && <span className="text-sm">🏛️</span>}
                  
                  {editingNode === node.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      defaultValue={node.title}
                      className="font-medium text-gray-900 text-xs bg-transparent border-b border-gray-300 outline-none flex-1"
                      onBlur={(e) => saveEdit(node.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(node.id, e.target.value)}
                    />
                  ) : (
                    <h3 className="font-medium text-gray-900 text-xs flex-1 leading-tight">{node.title}</h3>
                  )}
                </div>
                
                <div className="node-controls flex items-center gap-0.5">
                  <button 
                    onClick={() => toggleExpand(node.id)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
                  >
                    {node.expanded ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
              
              {/* Node Content */}
              {node.expanded && (
                <>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">{node.content}</p>
                  
                  {/* Tags */}
                  <div className="flex gap-1 mb-2">
                    {node.tags.map((tag, index) => (
                      <span key={index} className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Node Actions */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => likeNode(node.id)}
                        className="flex items-center gap-1 hover:text-red-500"
                      >
                        <Heart size={10} />
                        {node.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <MessageCircle size={10} />
                        {node.comments}
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">2m</div>
                  </div>
                </>
              )}
              
              {/* Collaborator indicator */}
              {node.id === 5 && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  A
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Compact Bottom Toolbar */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <button 
            onClick={() => setShowMiniMap(!showMiniMap)}
            className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
          >
            {showMiniMap ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
          </button>
          <button className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
            <Zap className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={tidyUp}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 text-sm"
          >
            <Sparkles className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Tidy</span>
          </button>
        </div>

        {/* Compact Add Node Button */}
        <button 
          onClick={() => addNewNode(300, 200)}
          className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Compact Helper Text */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs">
          💡 Double-click to create • Right-click for options
        </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MindMapInterface;