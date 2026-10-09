import { useRef, useState } from 'react';
import { useMindMap } from './hooks/useMindMap';
import { useNodeDrag } from './hooks/useNodeDrag';
import { useContextMenu } from './hooks/useContextMenu';
import { useNotifications } from './hooks/useNotifications';
import MindMapHeader from './components/MindMapHeader';
import MindMapMiniMap from './components/MindMapMiniMap';
import MindMapZoomControls from './components/MindMapZoomControls';
import MindMapConnections from './components/MindMapConnections';
import MindMapNode from './components/MindMapNode';
import MindMapContextMenu from './components/MindMapContextMenu';
import MindMapToolbar from './components/MindMapToolbar';
import NotificationStack from './components/NotificationStack';

// Mind map page: the user's saved graph of draggable nodes and connections
// (auto-saved via useMindMap) with zoom, a mini map, a context menu, and toasts.
const MindMap = () => {
  const { notifications, notify } = useNotifications();
  const map = useMindMap(notify);
  const contextMenu = useContextMenu();
  const [zoom, setZoom] = useState(100);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const canvasRef = useRef(null);

  const { startDrag } = useNodeDrag({
    canvasRef,
    zoom,
    onMove: map.moveNode,
    onDragEnd: () => {},
  });

  // Context-menu actions close the menu after running.
  const menuAction = (action) => () => {
    action(contextMenu.menu.nodeId);
    contextMenu.close();
  };

  // Converts a viewport point to canvas coordinates at the current zoom.
  const toCanvasPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / (zoom / 100), y: (e.clientY - rect.top) / (zoom / 100) };
  };

  const handleNodeClick = (nodeId) => {
    if (map.connectingFrom && map.connectingFrom !== nodeId) {
      map.completeConnection(nodeId);
    } else {
      map.setSelectedNode(nodeId);
    }
  };

  return (
    <div className="h-full bg-[#FCF4F1] flex relative overflow-hidden">
      <div className="flex-1 flex flex-col bg-[#FCF4F1]">
        <NotificationStack notifications={notifications} />

        {contextMenu.menu.visible && (
          <MindMapContextMenu
            x={contextMenu.menu.x}
            y={contextMenu.menu.y}
            onEdit={menuAction(map.startEditing)}
            onDuplicate={menuAction(map.duplicateNode)}
            onConnect={menuAction(map.startConnection)}
            onDelete={menuAction(map.deleteNode)}
          />
        )}

        <MindMapHeader saveStatus={map.saveStatus} />

        <div className="flex-1 relative overflow-hidden bg-[#FCF4F1]">
          {showMiniMap && <MindMapMiniMap nodes={map.nodes} onHide={() => setShowMiniMap(false)} />}

          <MindMapZoomControls zoom={zoom} onZoomChange={setZoom} />

          <div
            ref={canvasRef}
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
            onDoubleClick={(e) => {
              if (!map.isLoaded) return;
              const { x, y } = toCanvasPoint(e);
              map.addNode(x, y);
            }}
          >
            <MindMapConnections
              nodes={map.nodes}
              connections={map.connections}
              connectingFrom={map.connectingFrom}
            />

            {map.nodes.map((node) => (
              <MindMapNode
                key={node.id}
                node={node}
                isSelected={map.selectedNode === node.id}
                isConnecting={map.connectingFrom === node.id}
                isEditing={map.editingNode === node.id}
                onMouseDown={(e) => {
                  if (startDrag(e, node)) map.setSelectedNode(node.id);
                }}
                onContextMenu={(e) => contextMenu.open(e, node.id)}
                onClick={() => handleNodeClick(node.id)}
                onStartEdit={() => map.startEditing(node.id)}
                onSaveEdit={(fields) => map.saveEdit(node.id, fields)}
                onCancelEdit={map.cancelEdit}
                onToggleExpand={() => map.toggleExpand(node.id)}
              />
            ))}
          </div>

          {map.isLoaded && map.nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl bg-white/80 px-5 py-4 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-800">Your mind map is empty</p>
                <p className="mt-1 text-xs text-gray-500">Double-click anywhere or use + to add your first idea.</p>
              </div>
            </div>
          )}

          <MindMapToolbar
            showMiniMap={showMiniMap}
            onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
            onTidy={map.tidyUp}
            onAddNode={() => map.isLoaded && map.addNode(300, 200)}
          />
        </div>
      </div>

      <style>{`
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

export default MindMap;
