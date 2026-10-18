'use strict';

// Athena's tool-using chat agent, as a LangGraph state graph:
//
//   START → model ─┬─ function calls ──→ tools ─┬─ rounds left ─→ model
//                  ├─ claims a change it never   └─ out of rounds → giveUp → END
//                  │  made (once) → model (nudged)
//                  └─ final reply → END
//
// The nodes call Gemini through config/vertex (retries, thought signatures and all)
// and the app's tools through agent/tools, both injected so the graph can be tested
// without Vertex or Firestore.

const { StateGraph, Annotation, START, END } = require('@langchain/langgraph');

// "I've added …", "I have deleted …", "I marked …" — a reply that reports a change.
const CHANGE_CLAIM = /\bI(?:'ve|’ve| have)?\s+(?:now\s+|also\s+|just\s+)?(?:added|deleted|removed|created|updated|moved|renamed|marked|logged|saved|written|wrote|completed|scheduled|connected|changed|cleared|recorded)\b/i;
const claimsChange = (text = '') => CHANGE_CLAIM.test(text);
const UNDONE_NOTE = '(Note from the app, not the user: your last reply describes a change, but no tool was called, so nothing in the app changed. If the user asked for a change, call the tools now to make it. Otherwise, rewrite your reply without claiming any change.)';

// The model sometimes imitates the history's "(Actions taken: …)" note; the app shows actions itself.
const stripActionNote = (text = '') => text.replace(/\s*\(Actions taken:[^)]*\)?\s*$/i, '').trim();

// Used when the model stops without a final sentence.
const fallbackText = (actions) => {
  if (!actions.length) throw new Error('Empty response from Vertex AI');
  return `Done: ${actions.join('; ')}.`;
};

const append = (a, b) => a.concat(b);
const latest = (a, b) => b;

const AgentState = Annotation.Root({
  contents: Annotation({ reducer: append, default: () => [] }), // Gemini contents so far
  actions: Annotation({ reducer: append, default: () => [] }),  // one line per change made
  calls: Annotation({ reducer: latest, default: () => [] }),    // function calls awaiting tools
  rounds: Annotation({ reducer: latest, default: () => 0 }),    // model calls made
  nudged: Annotation({ reducer: latest, default: () => false }),
  text: Annotation({ reducer: latest, default: () => undefined }), // final reply; set → done
});

// generate: config/vertex generate. runTool(userId, name, args) → { result, action? }.
// isReadOnly(name): calls in a round that are all reads run in parallel.
// maxRounds: upper bound on model calls per message (each may make several tool calls).
const buildAgent = ({ generate, runTool, functionDeclarations, isReadOnly = () => false, maxRounds = 8 }) => {
  const model = async (state, config) => {
    const { systemInstruction } = config.configurable;
    const rounds = state.rounds + 1;
    let text;
    let response;
    try {
      ({ text, response } = await generate({ contents: state.contents, systemInstruction, tools: [{ functionDeclarations }] }));
    } catch (err) {
      // Changes already made must not be hidden behind an error: report them.
      if (!state.actions.length) throw err;
      console.error('Vertex AI error after tool calls:', err);
      return { rounds, calls: [], text: `${fallbackText(state.actions)} (I couldn't finish my reply — please ask again if you need more.)` };
    }
    const calls = response.functionCalls || [];
    // Keep the model's turn as returned (it carries the calls and any thought signatures).
    const turn = response.candidates?.[0]?.content || { role: 'model', parts: [{ text }] };
    if (calls.length) return { rounds, calls, contents: [turn] };
    // Guard: the reply says something was changed, but no tool ran this turn, so
    // nothing changed. Tell the model once and let it act or correct itself.
    if (!state.actions.length && !state.nudged && claimsChange(text)) {
      return { rounds, calls: [], nudged: true, contents: [turn, { role: 'user', parts: [{ text: UNDONE_NOTE }] }] };
    }
    return { rounds, calls: [], text: stripActionNote(text) || fallbackText(state.actions) };
  };

  const tools = async (state, config) => {
    const { userId } = config.configurable;
    const run = (call) => runTool(userId, call.name, call.args);
    let outcomes;
    if (state.calls.every((call) => isReadOnly(call.name))) {
      outcomes = await Promise.all(state.calls.map(run));
    } else {
      // Changes run one at a time, in the order the model asked for them.
      outcomes = [];
      for (const call of state.calls) outcomes.push(await run(call));
    }
    const parts = state.calls.map((call, i) => ({
      functionResponse: { name: call.name, ...(call.id ? { id: call.id } : {}), response: outcomes[i].result },
    }));
    return { calls: [], contents: [{ role: 'user', parts }], actions: outcomes.map((o) => o.action).filter(Boolean) };
  };

  const giveUp = (state) => ({ text: fallbackText(state.actions) });

  const afterModel = (state) => {
    if (state.text !== undefined) return END;
    if (state.calls.length) return 'tools';
    return state.rounds < maxRounds ? 'model' : 'giveUp';
  };
  const afterTools = (state) => (state.rounds < maxRounds ? 'model' : 'giveUp');

  const graph = new StateGraph(AgentState)
    .addNode('model', model)
    .addNode('tools', tools)
    .addNode('giveUp', giveUp)
    .addEdge(START, 'model')
    .addConditionalEdges('model', afterModel, ['tools', 'model', 'giveUp', END])
    .addConditionalEdges('tools', afterTools, ['model', 'giveUp'])
    .addEdge('giveUp', END)
    .compile();

  // contents: Gemini contents ending with the user's turn.
  // → { text, actions: [string] }
  const run = async ({ contents, userId, systemInstruction }) => {
    const state = await graph.invoke(
      { contents },
      // Each round is a model step plus a tools step; leave room for giveUp.
      { configurable: { userId, systemInstruction }, recursionLimit: maxRounds * 2 + 2 },
    );
    return { text: state.text, actions: state.actions };
  };

  return { graph, run };
};

module.exports = { buildAgent, claimsChange, stripActionNote };
