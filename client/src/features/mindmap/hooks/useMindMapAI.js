import { useState } from 'react';
import * as mindmapService from '../../../services/mindmapService';
import { applyConnectionProposal, applyNodeProposal } from '../utils/proposalUtils';

// State for the Athena panel: one request at a time, its result (a proposal to review,
// an answer, or plan results), and undo for the last applied proposal.
//
// result.kind: 'nodes' | 'connections' | 'plan' | 'executed' | 'answer' | 'crisis'
// Proposals change nothing until accepted; accepted map changes go through the map's
// normal auto-save. map: useMindMap(). onLinkedChange: refresh linked tasks.
export const useMindMapAI = ({ map, notify, onLinkedChange }) => {
  const [pending, setPending] = useState(null); // label of the running request
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [undo, setUndo] = useState(null); // { before, after, message }

  // Saves pending map edits first: the server reads the saved map.
  const run = async (label, kind, call, meta = {}) => {
    setPending(label);
    setError(null);
    setResult(null);
    try {
      await map.flushSave();
      const data = await call();
      setResult(data.crisis ? { kind: 'crisis', data } : { kind, data, ...meta });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setPending(null);
    }
  };

  const generate = (prompt, { anchorId = null, replace = false } = {}) =>
    run(anchorId ? 'Building a branch…' : 'Building your map…', 'nodes', () => mindmapService.generateMap({ prompt, anchorId }), { replace });
  const expand = (nodeId, instructions) =>
    run('Expanding…', 'nodes', () => mindmapService.expandNode({ nodeId, instructions }));
  const findConnections = (nodeId, focus = 'related') =>
    run(focus === 'dependencies' ? 'Looking for dependencies…' : 'Looking for connections…', 'connections', () => mindmapService.suggestConnections({ nodeId, focus }));
  const plan = (nodeId, mode) =>
    run(mode === 'schedule' ? 'Planning sessions…' : 'Planning tasks…', 'plan', () => mindmapService.planFromNode({ nodeId, mode }));
  const ask = (nodeId, action, question) =>
    run('Thinking…', 'answer', () => mindmapService.askAboutNode({ nodeId, action, question }), { nodeId });

  // Undo is offered only while the map is exactly as the proposal left it.
  const remember = (before, after, message) => {
    setUndo({ before, after, message });
    setResult(null);
    notify(message);
  };

  const applyNodes = ({ accepted, titles, replace }) => {
    const before = map.getGraph();
    const next = applyNodeProposal(before, result.data, { accepted, titles, replace });
    map.replaceGraph(next);
    remember(before, { nodes: next.nodes, connections: next.connections }, `Added ${next.addedIds.length} idea${next.addedIds.length === 1 ? '' : 's'}`);
  };

  const applyConnections = ({ accepted, types }) => {
    const before = map.getGraph();
    const { connections, added } = applyConnectionProposal(before, result.data.connections, { accepted, types });
    const after = { nodes: before.nodes, connections };
    map.replaceGraph(after);
    remember(before, after, `Added ${added} connection${added === 1 ? '' : 's'}`);
  };

  const canUndo = Boolean(undo) && map.getGraph().nodes === undo.after.nodes && map.getGraph().connections === undo.after.connections;
  const undoLast = () => {
    if (!canUndo) return;
    map.replaceGraph(undo.before);
    setUndo(null);
    notify('Undone');
  };

  // Runs the approved plan. Repeating it (Retry) is safe: the server skips finished steps.
  const execute = async (approved) => {
    setPending('Creating…');
    setError(null);
    try {
      const data = await mindmapService.executePlan(approved);
      setResult({ kind: 'executed', data, approved });
      onLinkedChange();
    } catch (err) {
      // The plan stays on screen; approving again is safe (finished steps are skipped).
      setError(`${err.message || 'Something went wrong.'} You can try again safely; nothing will be created twice.`);
    } finally {
      setPending(null);
    }
  };

  const dismiss = () => {
    setResult(null);
    setError(null);
  };

  return {
    pending,
    result,
    error,
    undo: canUndo ? undo : null,
    generate,
    expand,
    findConnections,
    plan,
    ask,
    applyNodes,
    applyConnections,
    execute,
    undoLast,
    dismiss,
  };
};
