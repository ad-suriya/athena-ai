// Pure helpers for the mind map. Nodes are 192px wide (w-48); connections attach
// at (x + 90, y + 40).

const NODE_ANCHOR = { x: 90, y: 40 };

export const NODE_TYPE_ICONS = {
  ai: '🤖',
  note: '📝',
  secondary: '🧠',
  main: '🏛️',
};

export const getNodeStyle = (type, isSelected, isConnecting) => {
  let base = 'transition-shadow duration-150 hover:shadow-card';

  if (isSelected) base += ' ring-2 ring-brand-400';
  if (isConnecting) base += ' ring-2 ring-brand-300 animate-pulse';

  switch (type) {
    case 'main':
      return `${base} bg-white border-2 border-brand-400 shadow-card`;
    case 'note':
      return `${base} bg-[#FFF8EC] border border-amber-200`;
    case 'ai':
      return `${base} bg-brand-50 border border-brand-200`;
    default:
      return `${base} bg-white border border-line`;
  }
};

export const nodeAnchor = (node) => ({ x: node.x + NODE_ANCHOR.x, y: node.y + NODE_ANCHOR.y });

// Quadratic curve between two node anchors, bowed 30px to the right.
export const connectionPath = (fromNode, toNode) => {
  const from = nodeAnchor(fromNode);
  const to = nodeAnchor(toNode);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const offset = 30;
  return `M ${from.x} ${from.y} Q ${midX + offset} ${midY} ${to.x} ${to.y}`;
};

// 1 for an empty map (Math.max() of nothing is -Infinity).
export const nextNodeId = (nodes) => (nodes.length ? Math.max(...nodes.map(n => n.id)) + 1 : 1);

// A new node centered on (x, y).
export const createNode = (id, x, y, type = 'secondary') => ({
  id,
  x: x - NODE_ANCHOR.x,
  y: y - NODE_ANCHOR.y,
  title: 'New idea',
  content: '',
  type,
  expanded: true,
});

// Grid layout: 3 columns, 200px apart horizontally, 150px vertically.
export const tidyLayout = (nodes) => nodes.map((node, index) => ({
  ...node,
  x: 100 + (index % 3) * 200,
  y: 100 + Math.floor(index / 3) * 150
}));
