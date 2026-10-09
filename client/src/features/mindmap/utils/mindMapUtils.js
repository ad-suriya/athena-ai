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

const TAG_COLORS = {
  telegram: 'bg-blue-100 text-blue-700',
  article: 'bg-green-100 text-green-700',
  notion: 'bg-gray-100 text-gray-700',
  obsidian: 'bg-purple-100 text-purple-700',
  new: 'bg-orange-100 text-orange-700'
};

export const getTagColor = (tag) => TAG_COLORS[tag] || 'bg-gray-100 text-gray-700';

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
export const createNode = (id, x, y) => ({
  id,
  x: x - NODE_ANCHOR.x,
  y: y - NODE_ANCHOR.y,
  title: "New Idea",
  content: "Click to edit this node...",
  tags: ["new"],
  type: "secondary",
  expanded: true,
  likes: 0,
  comments: 0
});

// Grid layout: 3 columns, 200px apart horizontally, 150px vertically.
export const tidyLayout = (nodes) => nodes.map((node, index) => ({
  ...node,
  x: 100 + (index % 3) * 200,
  y: 100 + Math.floor(index / 3) * 150
}));
