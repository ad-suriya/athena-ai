// Mind map API: one map per user, saved whole, plus Athena's mind map features.
import { get, post, put } from './api';

const MINDMAP = '/api/mindmap';

// → { nodes, connections, updatedAt }
export const getMap = () => get(MINDMAP);
export const saveMap = ({ nodes, connections }) => put(MINDMAP, { nodes, connections });

// → { [nodeId]: { tasks: [{ id, title, status, priority, dueDate }], progress } }
export const getLinkedTasks = () => get(`${MINDMAP}/linked-tasks`);

// Athena. Proposals (generate, expand, connections, plan) save nothing; the page applies
// what the user accepts. Any of them may return { crisis: true, text } instead.
const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// → { anchorId, nodes: [{ ref, title, description, parent, similarTo? }], edges, dropped }
export const generateMap = ({ prompt, anchorId = null }) => post(`${MINDMAP}/ai/generate`, { prompt, anchorId, timeZone: timeZone() });
export const expandNode = ({ nodeId, instructions }) => post(`${MINDMAP}/ai/expand`, { nodeId, instructions, timeZone: timeZone() });
// → { connections: [{ from, to, type, reason, strength }], rejected, considered }
export const suggestConnections = ({ nodeId, focus }) => post(`${MINDMAP}/ai/connections`, { nodeId, focus });
// mode: 'tasks' | 'steps' | 'schedule' → { proposalId, nodeId, mode, tasks, events, skipped }
export const planFromNode = ({ nodeId, mode }) => post(`${MINDMAP}/ai/plan`, { nodeId, mode, timeZone: timeZone() });
// Safe to repeat with the same proposalId. → { nodeId, results, summary }
export const executePlan = (plan) => post(`${MINDMAP}/ai/execute`, plan);
// action: 'ask' | 'explain' | 'summarize' | 'blockers' | 'progress' | 'dependencies' → { text, progress }
export const askAboutNode = ({ nodeId, action, question }) => post(`${MINDMAP}/ai/ask`, { nodeId, action, question, timeZone: timeZone() });
