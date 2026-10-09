// Mind map API: one map per user, saved whole.
import { get, put } from './api';

const MINDMAP = '/api/mindmap';

// → { nodes, connections, updatedAt }
export const getMap = () => get(MINDMAP);
export const saveMap = ({ nodes, connections }) => put(MINDMAP, { nodes, connections });
