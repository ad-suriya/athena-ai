import { useState } from 'react';
import { INITIAL_CONNECTIONS, INITIAL_NODES } from '../data/initialMindMap';
import { createNode, nextNodeId, tidyLayout } from '../utils/mindMapUtils';

// Mind map graph (nodes + connections) and selection/editing/connecting state.
// notify(message) is called after user-visible changes.
export const useMindMap = (notify) => {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);

  const updateNode = (nodeId, update) => {
    setNodes(prev => prev.map(node => (node.id === nodeId ? { ...node, ...update(node) } : node)));
  };

  const moveNode = (nodeId, x, y) => updateNode(nodeId, () => ({ x, y }));

  const startEditing = (nodeId) => setEditingNode(nodeId);

  const saveEdit = (nodeId, newTitle) => {
    updateNode(nodeId, () => ({ title: newTitle }));
    setEditingNode(null);
    notify('Node updated');
  };

  const toggleExpand = (nodeId) => updateNode(nodeId, node => ({ expanded: !node.expanded }));

  const duplicateNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setNodes(prev => [...prev, {
      ...node,
      id: nextNodeId(nodes),
      x: node.x + 30,
      y: node.y + 30,
      title: `${node.title} (Copy)`
    }]);
    notify('Node duplicated');
  };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    notify('Node deleted');
  };

  const likeNode = (nodeId) => {
    updateNode(nodeId, node => ({ likes: (node.likes || 0) + 1 }));
    notify('❤️ Liked!');
  };

  const startConnection = (nodeId) => {
    setConnectingFrom(nodeId);
    notify('Click another node to create connection');
  };

  const completeConnection = (toNodeId) => {
    if (connectingFrom && connectingFrom !== toNodeId) {
      setConnections(prev => [...prev, { from: connectingFrom, to: toNodeId }]);
      notify('Connection created');
    }
    setConnectingFrom(null);
  };

  // Adds a node centered at (x, y) and starts editing its title.
  const addNode = (x, y) => {
    const node = createNode(nextNodeId(nodes), x, y);
    setNodes(prev => [...prev, node]);
    startEditing(node.id);
    notify('New node created');
  };

  const tidyUp = () => {
    setNodes(prev => tidyLayout(prev));
    notify('Nodes arranged');
  };

  return {
    nodes,
    connections,
    selectedNode,
    setSelectedNode,
    editingNode,
    connectingFrom,
    moveNode,
    startEditing,
    saveEdit,
    toggleExpand,
    duplicateNode,
    deleteNode,
    likeNode,
    startConnection,
    completeConnection,
    addNode,
    tidyUp,
  };
};
