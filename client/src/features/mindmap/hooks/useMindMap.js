import { useEffect, useRef, useState } from 'react';
import * as mindmapService from '../../../services/mindmapService';
import { createNode, nextNodeId, tidyLayout, toPayload } from '../utils/mindMapUtils';
import { hasConnection } from '../utils/proposalUtils';

const SAVE_DELAY_MS = 800;

// Mind map graph (nodes + connections), loaded from and auto-saved to the API,
// plus selection/editing/connecting state. notify(message) is called after
// user-visible changes. saveStatus: 'loading' | 'saved' | 'saving' | 'error' | 'load-error'.
export const useMindMap = (notify) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [saveStatus, setSaveStatus] = useState('loading');
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  // JSON of the last map the server has; null until the first load succeeds.
  const savedJson = useRef(null);
  // The current graph, for flushSave and getGraph (called from event handlers).
  const graph = useRef({ nodes, connections });
  graph.current = { nodes, connections };

  useEffect(() => {
    let cancelled = false;
    mindmapService.getMap()
      .then((map) => {
        if (cancelled) return;
        savedJson.current = JSON.stringify(toPayload(map.nodes, map.connections));
        setNodes(map.nodes);
        setConnections(map.connections);
        setSaveStatus('saved');
      })
      .catch(() => {
        if (!cancelled) setSaveStatus('load-error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-save: once loaded, any change is saved after a short pause, so a drag
  // is saved once when it ends rather than on every mouse move.
  useEffect(() => {
    if (savedJson.current === null) return undefined;
    const payload = toPayload(nodes, connections);
    const json = JSON.stringify(payload);
    if (json === savedJson.current) return undefined;
    const timer = setTimeout(() => {
      if (json === savedJson.current) return; // flushSave got there first
      setSaveStatus('saving');
      mindmapService.saveMap(payload)
        .then(() => {
          savedJson.current = json;
          setSaveStatus('saved');
        })
        .catch(() => setSaveStatus('error'));
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [nodes, connections]);

  // Saves pending changes now instead of after the pause. Athena's features read the
  // saved map on the server, so they call this first to see what the user sees.
  const flushSave = async () => {
    if (savedJson.current === null) throw new Error('Your mind map has not loaded yet.');
    const payload = toPayload(graph.current.nodes, graph.current.connections);
    const json = JSON.stringify(payload);
    if (json === savedJson.current) return;
    setSaveStatus('saving');
    try {
      await mindmapService.saveMap(payload);
      savedJson.current = json;
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      throw err;
    }
  };

  const getGraph = () => graph.current;

  // Replaces nodes and connections at once (applying an accepted proposal, or undoing one).
  const replaceGraph = (next) => {
    setNodes(next.nodes);
    setConnections(next.connections);
    const ids = new Set(next.nodes.map(n => n.id));
    setSelectedNode(prev => (ids.has(prev) ? prev : null));
    setEditingNode(null);
    setConnectingFrom(null);
  };

  const updateNode = (nodeId, update) => {
    setNodes(prev => prev.map(node => (node.id === nodeId ? { ...node, ...update(node) } : node)));
  };

  const moveNode = (nodeId, x, y) => updateNode(nodeId, () => ({ x, y }));

  const startEditing = (nodeId) => setEditingNode(nodeId);

  const saveEdit = (nodeId, { title, content }) => {
    updateNode(nodeId, () => ({ title, content }));
    setEditingNode(null);
  };

  const cancelEdit = () => setEditingNode(null);

  const toggleExpand = (nodeId) => updateNode(nodeId, node => ({ expanded: !node.expanded }));

  // status: one of utils/nodeStatus NODE_STATUSES, or null to clear it.
  const setNodeStatus = (nodeId, status) => updateNode(nodeId, () => ({ status: status || undefined }));

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
    if (selectedNode === nodeId) setSelectedNode(null);
    notify('Node deleted');
  };

  const startConnection = (nodeId) => {
    setConnectingFrom(nodeId);
    notify('Click another node to create connection');
  };

  const completeConnection = (toNodeId) => {
    if (connectingFrom && connectingFrom !== toNodeId && !hasConnection(connections, connectingFrom, toNodeId)) {
      setConnections(prev => [...prev, { from: connectingFrom, to: toNodeId }]);
      notify('Connection created');
    }
    setConnectingFrom(null);
  };

  // Adds a node centered at (x, y) and starts editing it. The first node is the main one.
  const addNode = (x, y) => {
    const node = createNode(nextNodeId(nodes), x, y, nodes.length === 0 ? 'main' : 'secondary');
    setNodes(prev => [...prev, node]);
    startEditing(node.id);
  };

  const tidyUp = () => {
    setNodes(prev => tidyLayout(prev));
    notify('Nodes arranged');
  };

  return {
    nodes,
    connections,
    saveStatus,
    isLoaded: saveStatus !== 'loading' && saveStatus !== 'load-error',
    selectedNode,
    setSelectedNode,
    editingNode,
    connectingFrom,
    moveNode,
    startEditing,
    saveEdit,
    cancelEdit,
    toggleExpand,
    duplicateNode,
    deleteNode,
    startConnection,
    completeConnection,
    addNode,
    tidyUp,
    setNodeStatus,
    flushSave,
    getGraph,
    replaceGraph,
  };
};
