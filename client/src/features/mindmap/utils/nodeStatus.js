// Optional progress status on a node, and the kinds of typed connections.
// Nodes without a status show nothing.

export const NODE_STATUSES = [
  { id: 'idea', label: 'Idea', dot: 'bg-ink-faint' },
  { id: 'planned', label: 'Planned', dot: 'bg-sky-400' },
  { id: 'in_progress', label: 'In progress', dot: 'bg-amber-400' },
  { id: 'blocked', label: 'Blocked', dot: 'bg-brand-600' },
  { id: 'completed', label: 'Done', dot: 'bg-emerald-500' },
];

export const statusMeta = (id) => NODE_STATUSES.find((s) => s.id === id) || null;

// Short labels drawn on typed connections and used in the suggestion preview.
export const CONNECTION_TYPES = [
  { id: 'related', label: 'related' },
  { id: 'dependency', label: 'comes before' },
  { id: 'shared_goal', label: 'shared goal' },
  { id: 'blocker', label: 'may block' },
  { id: 'cause', label: 'leads to' },
  { id: 'overlap', label: 'overlaps' },
];

export const connectionLabel = (type) => CONNECTION_TYPES.find((t) => t.id === type)?.label || type;

export const TASK_STATUS_LABELS = { todo: 'To do', in_progress: 'In progress', completed: 'Done', cancelled: 'Cancelled' };
