import PropTypes from 'prop-types';
import { connectionPath, nodeAnchor } from '../utils/mindMapUtils';
import { connectionShape, nodeShape } from './mindMapPropTypes';

// SVG layer with curved arrows between nodes, plus a pulse on the node
// a new connection starts from.
const MindMapConnections = ({ nodes, connections, connectingFrom }) => {
  const byId = (id) => nodes.find(n => n.id === id);
  const connectingNode = connectingFrom ? byId(connectingFrom) : null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>
      {connections.map((conn, index) => {
        const fromNode = byId(conn.from);
        const toNode = byId(conn.to);
        if (!fromNode || !toNode) return null;

        return (
          <g key={index}>
            <path
              d={connectionPath(fromNode, toNode)}
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

      {connectingNode && (
        <circle cx={nodeAnchor(connectingNode).x}
                cy={nodeAnchor(connectingNode).y}
                r="3" fill="#10b981" className="animate-ping" />
      )}
    </svg>
  );
};

MindMapConnections.propTypes = {
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
  connections: PropTypes.arrayOf(connectionShape).isRequired,
  connectingFrom: PropTypes.number,
};

export default MindMapConnections;
