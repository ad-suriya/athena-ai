import PropTypes from 'prop-types';
import { Loader2, Sparkles, Undo2, X } from 'lucide-react';
import { statusMeta } from '../../utils/nodeStatus';
import NodeAthenaActions from './NodeAthenaActions';
import MapAthenaActions from './MapAthenaActions';
import NodeProposalReview from './NodeProposalReview';
import ConnectionReview from './ConnectionReview';
import TaskPlanReview from './TaskPlanReview';
import PlanResults from './PlanResults';
import { secondaryButton } from './panelStyles';

// Athena's side panel on the mind map. A right-hand column on large screens and a
// bottom sheet on small ones, so the map stays usable. It shows, in order: a running
// request, an error, a result to review, or the actions for the selected node (or the
// whole map when nothing is selected).
//
// map: useMindMap(). ai: useMindMapAI(). linked: useLinkedTasks().linked.
const MindMapAIPanel = ({ map, ai, linked, onClose }) => {
  const node = map.nodes.find((n) => n.id === map.selectedNode) || null;
  const busy = Boolean(ai.pending);
  const titleOf = (id) => map.nodes.find((n) => n.id === id)?.title;

  const runAction = (id) => {
    if (id === 'expand') ai.expand(node.id);
    else if (id === 'related' || id === 'dependencies') ai.findConnections(node.id, id);
    else if (['tasks', 'steps', 'schedule'].includes(id)) ai.plan(node.id, id);
    else ai.ask(node.id, id);
  };

  const { result } = ai;
  let body;
  if (result?.kind === 'nodes') {
    body = (
      <NodeProposalReview
        proposal={result.data}
        anchorTitle={result.data.anchorId ? titleOf(result.data.anchorId) : undefined}
        replace={Boolean(result.replace)}
        mapSize={map.nodes.length}
        onApply={ai.applyNodes}
        onDiscard={ai.dismiss}
      />
    );
  } else if (result?.kind === 'connections') {
    body = <ConnectionReview suggestions={result.data.connections} nodes={map.nodes} onApply={ai.applyConnections} onDiscard={ai.dismiss} />;
  } else if (result?.kind === 'plan') {
    body = <TaskPlanReview plan={result.data} nodeTitle={titleOf(result.data.nodeId) || 'this idea'} busy={busy} onApprove={ai.execute} onDiscard={ai.dismiss} />;
  } else if (result?.kind === 'executed') {
    body = <PlanResults outcome={result.data} busy={busy} onRetry={() => ai.execute(result.approved)} onDone={ai.dismiss} />;
  } else if (result?.kind === 'answer' || result?.kind === 'crisis') {
    body = (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{result.data.text}</p>
        <button type="button" onClick={ai.dismiss} className={secondaryButton}>Back</button>
      </div>
    );
  } else if (node) {
    body = (
      <NodeAthenaActions
        key={node.id}
        node={node}
        linked={linked[node.id]}
        busy={busy}
        onStatus={(status) => map.setNodeStatus(node.id, status)}
        onAction={runAction}
        onAsk={(question) => ai.ask(node.id, 'ask', question)}
        onBranch={(text) => ai.generate(text, { anchorId: node.id })}
      />
    );
  } else {
    body = (
      <MapAthenaActions
        nodeCount={map.nodes.length}
        busy={busy || !map.isLoaded}
        onGenerate={(prompt, replace) => ai.generate(prompt, { replace })}
        onFindConnections={() => ai.findConnections(undefined)}
      />
    );
  }

  const status = statusMeta(node?.status);

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-40 flex max-h-[70vh] flex-col rounded-t-card border-t border-line bg-white shadow-card lg:static lg:z-auto lg:max-h-none lg:w-[360px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none"
      aria-label="Athena"
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-brand-500" aria-hidden="true" /> Athena
          </p>
          <p className="truncate text-xs text-ink-muted">
            {node ? (
              <>
                {status && <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${status.dot}`} aria-hidden="true" />}
                {node.title}
              </>
            ) : 'Whole map'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {node && !result && (
            <button type="button" onClick={() => map.setSelectedNode(null)} className="rounded-lg px-2 py-1 text-xs text-ink-muted hover:bg-brand-50 hover:text-ink">
              Whole map
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-faint hover:bg-brand-50 hover:text-ink" aria-label="Close Athena panel">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {ai.undo && !result && (
          <div className="flex items-center justify-between rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink">
            {ai.undo.message}
            <button type="button" onClick={ai.undoLast} className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </button>
          </div>
        )}
        {ai.error && (
          <div className="flex items-start justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-700" role="alert">
            <span>{ai.error}</span>
            {!result && <button type="button" onClick={ai.dismiss} className="shrink-0 font-semibold">Dismiss</button>}
          </div>
        )}
        {ai.pending ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin text-brand-500" aria-hidden="true" /> {ai.pending}
          </p>
        ) : body}
      </div>

      <p className="shrink-0 border-t border-line px-4 py-2 text-[11px] leading-snug text-ink-faint">
        Athena can be wrong, and is not a substitute for professional care.
      </p>
    </aside>
  );
};

MindMapAIPanel.propTypes = {
  map: PropTypes.shape({
    nodes: PropTypes.array.isRequired,
    selectedNode: PropTypes.number,
    isLoaded: PropTypes.bool.isRequired,
    setSelectedNode: PropTypes.func.isRequired,
    setNodeStatus: PropTypes.func.isRequired,
  }).isRequired,
  ai: PropTypes.shape({
    pending: PropTypes.string,
    result: PropTypes.object,
    error: PropTypes.string,
    undo: PropTypes.shape({ message: PropTypes.string.isRequired }),
    generate: PropTypes.func.isRequired,
    expand: PropTypes.func.isRequired,
    findConnections: PropTypes.func.isRequired,
    plan: PropTypes.func.isRequired,
    ask: PropTypes.func.isRequired,
    applyNodes: PropTypes.func.isRequired,
    applyConnections: PropTypes.func.isRequired,
    execute: PropTypes.func.isRequired,
    undoLast: PropTypes.func.isRequired,
    dismiss: PropTypes.func.isRequired,
  }).isRequired,
  linked: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MindMapAIPanel;
