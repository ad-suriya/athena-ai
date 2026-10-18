import PropTypes from 'prop-types';
import { connectionPath, nodeAnchor } from '../utils/mindMapUtils';
import { connectionLabel } from '../utils/nodeStatus';
import { connectionShape, nodeShape } from './mindMapPropTypes';

// SVG layer with curved arrows between nodes, plus a pulse on the node
// a new connection starts from. Typed links (related, dependency, …) are dashed and
// labelled; hovering one shows the reason it was added.
const MindMapConnections = ({ nodes, connections, connectingFrom }) => {
  const byId = (id) => nodes.find(n => n.id === id);
  const connectingNode = connectingFrom ? byId(connectingFrom) : null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#E9A49E" />
        </marker>
        <marker id="arrowhead-typed" markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#8A8F9C" />
        </marker>
      </defs>
      {connections.map((conn, index) => {
        const fromNode = byId(conn.from);
        const toNode = byId(conn.to);
        if (!fromNode || !toNode) return null;

        if (!conn.type) {
          return (
            <g key={index}>
              <path
                d={connectionPath(fromNode, toNode)}
                stroke="#E9A49E"
                strokeWidth="1.75"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        }

        const from = nodeAnchor(fromNode);
        const to = nodeAnchor(toNode);
        return (
          <g key={index} className="pointer-events-auto">
            <title>{`${connectionLabel(conn.type)}${conn.label ? `: ${conn.label}` : ''}`}</title>
            <path
              d={connectionPath(fromNode, toNode)}
              stroke="#8A8F9C"
              strokeWidth="1.25"
              strokeDasharray="4 4"
              fill="none"
              markerEnd="url(#arrowhead-typed)"
            />
            {/* Wider invisible stroke so the hover target is easy to hit. */}
            <path d={connectionPath(fromNode, toNode)} stroke="transparent" strokeWidth="10" fill="none" />
            <text x={(from.x + to.x) / 2 + 15} y={(from.y + to.y) / 2 - 4} textAnchor="middle" fontSize="10" fill="#8A8F9C">
              {connectionLabel(conn.type)}
            </text>
          </g>
        );
      })}

      {connectingNode && (
        <circle cx={nodeAnchor(connectingNode).x}
                cy={nodeAnchor(connectingNode).y}
                r="4" fill="#E65C52" className="animate-ping" />
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
