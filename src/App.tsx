import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { generateEffectContract } from "./core/effect-contract";
import {
  runActionProof,
  ScenarioStore,
  scenarioDefinitions,
} from "./core/scenario";
import type { Snapshot, VerificationResult } from "./core/types";
import {
  createWebMcpBridge,
  type BridgeMode,
  type WebMcpBridge,
  type WebMcpTool,
} from "./webmcp/bridge";
import "./styles.css";

type Phase = 0 | 1 | 2 | 3 | 4;

const phaseLabels = [
  "Human intent",
  "Agent action",
  "Tool result",
  "Observed effect",
  "ActionProof verdict",
] as const;

const sleep = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function useScenarioSnapshot(store: ScenarioStore): Snapshot {
  const [snapshot, setSnapshot] = useState(() => store.snapshot());
  useSyncExternalStore(
    store.subscribe,
    () => {
      const next = store.snapshot();
      if (JSON.stringify(next) !== JSON.stringify(snapshot)) {
        setSnapshot(next);
      }
      return JSON.stringify(next);
    },
    () => JSON.stringify(snapshot),
  );
  return snapshot;
}
function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function App() {
  const stores = useMemo(
    () => new Map(scenarioDefinitions.map((definition) => [definition.id, new ScenarioStore(definition)])),
    [],
  );
  const [scenarioId, setScenarioId] = useState<"orders" | "permissions">("orders");
  const store = stores.get(scenarioId)!;
  const liveSnapshot = useScenarioSnapshot(store);
  const [displaySnapshot, setDisplaySnapshot] = useState<Snapshot>(() => store.snapshot());
  const [phase, setPhase] = useState<Phase>(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [runHistory, setRunHistory] = useState<VerificationResult[]>([]);
  const [bridge, setBridge] = useState<WebMcpBridge | null>(null);
  const [bridgeMode, setBridgeMode] = useState<BridgeMode | "initializing">("initializing");

  const speed = Math.max(
    0.01,
    Number(new URLSearchParams(window.location.search).get("speed") ?? "1"),
  );
  const autoplay = new URLSearchParams(window.location.search).get("autoplay");
  const autoplayStarted = useRef(false);

  useEffect(() => {
    let active = true;
    let installedBridge: WebMcpBridge | null = null;
    const tools: WebMcpTool[] = scenarioDefinitions.map((definition) => ({
      name: definition.toolName,
      title: definition.actionLabel,
      description: `${definition.actionLabel} for the one record explicitly selected in the visible test fixture.`,
      inputSchema: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(definition.toolArguments).map(([name, value]) => [name, { type: typeof value }]),
        ),
        required: Object.keys(definition.toolArguments),
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (argumentsRecord) => stores.get(definition.id)!.executeMutation(argumentsRecord),
    }));

    createWebMcpBridge(tools)
      .then((createdBridge) => {
        installedBridge = createdBridge;
        if (active) {
          setBridge(createdBridge);
          setBridgeMode(createdBridge.mode);
        } else {
          createdBridge.dispose();
        }
      })
      .catch((error) => {
        console.error("WebMCP bridge initialization failed", error);
        setBridgeMode("webmcp-compatible-harness");
      });

    return () => {
      active = false;
      installedBridge?.dispose();
    };
  }, [stores]);

  useEffect(() => {
    store.reset(true);
    setDisplaySnapshot(store.snapshot());
    setResult(null);
    setRunHistory([]);
    setPhase(0);
  }, [scenarioId, store]);

  async function runSequence(defectEnabled: boolean) {
    if (!bridge || running) return;
    setRunning(true);
    setResult(null);
    setPhase(0);
    store.reset(defectEnabled);
    const before = store.snapshot();
    setDisplaySnapshot(before);

    await sleep(4_000 * speed);
    setPhase(1);
    await sleep(4_000 * speed);

    const proof = await runActionProof({ store, executeTool: bridge.executeTool });
    setResult(proof);
    setRunHistory((history) => [...history, proof]);
    setPhase(2);
    await sleep(3_000 * speed);

    setDisplaySnapshot(store.snapshot());
    setPhase(3);
    await sleep(4_000 * speed);

    setPhase(4);
    await sleep(5_000 * speed);
    setRunning(false);
  }

  useEffect(() => {
    if (!bridge || autoplayStarted.current || !autoplay) return;
    autoplayStarted.current = true;
    const start = async () => {
      if (autoplay === "repair") {
        await runSequence(false);
        return;
      }
      await runSequence(true);
      if (autoplay === "both") await runSequence(false);
    };
    void start();
  }, [autoplay, bridge]);

  const definition = store.definition;
  const records = Object.values(displaySnapshot);
  const currentResult = result;
  const unexpectedIds = new Set(
    currentResult?.unexpectedChanges.map((change) => change.entityId) ?? [],
  );
  const selectedId = definition.targetId;
  const observedCount = currentResult?.observedChanges.filter(
    (change) => change.field === definition.mutation.field,
  ).length ?? 0;
  const contractPreview = useMemo(() => {
    const cleanStore = new ScenarioStore(definition);
    return generateEffectContract(cleanStore.explicitIntent(), cleanStore.snapshot());
  }, [definition]);
  const failedRun = [...runHistory].reverse().find((run) => run.verdict === "FAILED_EFFECT");
  const repairedRun = [...runHistory].reverse().find((run) => run.verdict === "ACTION_PROVEN");
  const identicalRegressionPassed = Boolean(
    failedRun &&
      repairedRun &&
      failedRun.regressionCase.id === repairedRun.regressionCase.id &&
      JSON.stringify(failedRun.regressionCase.contract) === JSON.stringify(repairedRun.regressionCase.contract) &&
      JSON.stringify(failedRun.regressionCase.arguments) === JSON.stringify(repairedRun.regressionCase.arguments),
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">AP</span>
          <div>
            <strong>ActionProof</strong>
            <span>Effect verification for WebMCP actions</span>
          </div>
        </div>
        <div className="topbar-badges">
          <span className="badge badge-neutral">Seeded regression</span>
          <span className="badge badge-neutral">Fake data · no transactions</span>
          <span
            className={`badge ${bridgeMode === "native-webmcp" ? "badge-native" : "badge-harness"}`}
            data-testid="bridge-mode"
          >
            {bridgeMode === "native-webmcp"
              ? "Native WebMCP active"
              : bridgeMode === "initializing"
                ? "Checking WebMCP…"
                : "WebMCP-compatible local harness"}
          </span>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">VERIFY THE EFFECT, NOT JUST THE INVOCATION</p>
        <h1>The agent did everything right. <em>The result was still wrong.</em></h1>
        <p>
          A correct tool call can still cause collateral change. ActionProof checks the declared effect against independently observed state.
        </p>
      </section>

      <nav className="scenario-tabs" aria-label="Proof scenarios">
        {scenarioDefinitions.map((candidate) => (
          <button
            key={candidate.id}
            className={candidate.id === scenarioId ? "active" : ""}
            disabled={running}
            onClick={() => setScenarioId(candidate.id)}
            type="button"
          >
            {candidate.tabLabel}
            {candidate.id === "permissions" && <span>same verifier</span>}
          </button>
        ))}
      </nav>

      <section className="proof-workspace">
        <div className="proof-header">
          <div>
            <span className="section-kicker">20-second silent proof</span>
            <h2>{definition.intentSummary}</h2>
          </div>
          <div className="proof-actions">
            <button
              className="button button-primary"
              data-testid="run-defect"
              disabled={!bridge || running}
              onClick={() => void runSequence(true)}
              type="button"
            >
              {running ? "Running proof…" : "Run seeded defect"}
            </button>
            <button
              className="button button-secondary"
              data-testid="run-fixed"
              disabled={!bridge || running}
              onClick={() => void runSequence(false)}
              type="button"
            >
              Run repaired version
            </button>
          </div>
        </div>

        <div className="timeline" aria-label="Proof sequence">
          {phaseLabels.map((label, index) => (
            <div
              key={label}
              className={`timeline-step ${phase >= index ? "revealed" : ""} ${phase === index ? "current" : ""}`}
            >
              <span>{index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        <div className="proof-grid">
          <article className="intent-panel panel">
            <div className="panel-title">
              <span className="step-number">01</span>
              <div>
                <span>HUMAN INTENT</span>
                <strong>Generated Effect Contract</strong>
              </div>
            </div>
            <div className="selection-callout">
              <span className="selection-check">✓</span>
              <div>
                <strong>{definition.targetId}</strong>
                <span>{definition.intentSummary}</span>
              </div>
              <span className="only-pill">ONLY</span>
            </div>
            <div className="contract-obligations" data-testid="effect-contract">
              <div>
                <span>REQUIRED</span>
                <strong>{contractPreview.required[0].entityId}.{contractPreview.required[0].field} → {String(contractPreview.required[0].expected)}</strong>
              </div>
              <div>
                <span>FORBIDDEN</span>
                <strong>{contractPreview.forbidden.length} unselected {definition.resourceLabel} change{contractPreview.forbidden.length === 1 ? "" : "s"}</strong>
              </div>
            </div>
            <p className="contract-source">Generated from visible selection + pre-action state</p>
          </article>

          <article className={`action-panel panel ${phase >= 1 ? "panel-live" : "panel-muted"}`}>
            <div className="panel-title">
              <span className="step-number">02</span>
              <div>
                <span>AGENT ACTION</span>
                <strong>Correct WebMCP call</strong>
              </div>
            </div>
            <div className="code-card">
              <span className="webmcp-chip">WebMCP</span>
              <code>{definition.toolName}</code>
              <pre>{formatJson(definition.toolArguments)}</pre>
            </div>
            <div className="call-correct">✓ Target matches visible selection</div>
          </article>

          <article className={`result-panel panel ${phase >= 2 ? "panel-live" : "panel-muted"}`}>
            <div className="panel-title">
              <span className="step-number">03</span>
              <div>
                <span>TOOL RESULT</span>
                <strong>Invocation succeeded</strong>
              </div>
            </div>
            <div className="tool-success">
              <span>✓</span>
              <div>
                <strong>success: true</strong>
                <small>Tool returned without error</small>
              </div>
            </div>
            <p className="warning-copy">A successful return is not proof of the resulting state.</p>
          </article>
        </div>

        <div className={`effect-stage ${phase >= 3 ? "revealed" : "stage-muted"}`}>
          <div className="records-panel panel">
            <div className="panel-title wide-title">
              <span className="step-number">04</span>
              <div>
                <span>OBSERVED EFFECT</span>
                <strong>Independent post-action state</strong>
              </div>
              {phase >= 3 && (
                <span className={`observed-pill ${unexpectedIds.size ? "bad" : "good"}`}>
                  {observedCount} {definition.resourceLabel}{observedCount === 1 ? "" : "s"} changed
                </span>
              )}
            </div>
            <div className="record-table" role="table">
              <div className="record-row record-head" role="row">
                <span>Selected</span>
                <span>ID</span>
                {definition.columns.map((column) => <span key={column.field}>{column.label}</span>)}
                <span>Effect</span>
              </div>
              {records.map((record) => {
                const selected = record.id === selectedId;
                const unexpected = unexpectedIds.has(record.id);
                const changed = record[definition.mutation.field] === definition.mutation.value;
                return (
                  <div
                    className={`record-row ${selected ? "selected" : ""} ${unexpected ? "unexpected" : ""}`}
                    key={record.id}
                    role="row"
                  >
                    <span className="checkbox-cell">{selected ? "✓" : "—"}</span>
                    <strong>{record.id}</strong>
                    {definition.columns.map((column) => (
                      <span key={column.field} className={column.field === definition.mutation.field && changed ? "changed-value" : ""}>
                        {String(record[column.field])}
                      </span>
                    ))}
                    <span>
                      {phase < 3 ? (
                        <span className="effect-label waiting">Waiting</span>
                      ) : unexpected ? (
                        <span className="effect-label unexpected-label">UNEXPECTED</span>
                      ) : changed ? (
                        <span className="effect-label required-label">REQUIRED</span>
                      ) : (
                        <span className="effect-label unchanged-label">UNCHANGED</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className={`verdict-panel ${currentResult?.verdict === "ACTION_PROVEN" ? "verdict-pass" : "verdict-fail"}`}>
            <div className="panel-title verdict-title">
              <span className="step-number">05</span>
              <div>
                <span>ACTIONPROOF VERDICT</span>
                <strong>Expected vs. actual</strong>
              </div>
            </div>
            {phase < 4 || !currentResult ? (
              <div className="verdict-waiting">
                <span>Comparing state…</span>
              </div>
            ) : currentResult.verdict === "ACTION_PROVEN" ? (
              <div data-testid="verdict-pass">
                <div className="score-line"><span>Required changes</span><strong>{currentResult.requiredSatisfied.length}/{currentResult.contract.required.length}</strong></div>
                <div className="score-line"><span>Unexpected changes</span><strong>0</strong></div>
                <div className="verdict-message pass-message">ACTION PROVEN</div>
              </div>
            ) : currentResult.verdict === "TOOL_CALL_FAILED" ? (
              <div data-testid="verdict-tool-failed">
                <div className="verdict-message fail-message">TOOL CALL FAILED</div>
                <p>Effect was not evaluated as a successful action.</p>
              </div>
            ) : (
              <div data-testid="verdict-fail">
                <div className="score-line"><span>Expected changes</span><strong>{currentResult.contract.required.length}</strong></div>
                <div className="score-line danger"><span>Unexpected changes</span><strong>{currentResult.unexpectedChanges.length}</strong></div>
                <div className="state-gap" data-testid="state-gap">REQUESTED {currentResult.contract.required.length} · CHANGED {observedCount}</div>
                <div className="verdict-message call-passed">TOOL CALL PASSED</div>
                <div className="verdict-message fail-message">REAL-WORLD EFFECT FAILED</div>
              </div>
            )}
          </aside>
        </div>

        {currentResult && phase >= 4 && (
          <div className="regression-strip" data-testid="regression-strip">
            <div>
              <span>REGRESSION RETAINED</span>
              <strong>{currentResult.regressionCase.id}</strong>
            </div>
            <p>Same generated contract · same tool arguments · reusable after the fix</p>
          </div>
        )}

        {failedRun && (
          <div className="regression-proof" data-testid="regression-proof">
            <div className="proof-node detected"><span>1</span><div><small>SEEDED DEFECT</small><strong>DETECTED</strong></div></div>
            <span className="proof-arrow">→</span>
            <div className={`proof-node ${repairedRun ? "repaired" : "pending"}`}><span>2</span><div><small>HANDLER</small><strong>{repairedRun ? "REPAIRED" : "REPAIR NEXT"}</strong></div></div>
            <span className="proof-arrow">→</span>
            <div className={`proof-node ${identicalRegressionPassed ? "passed" : "pending"}`}><span>3</span><div><small>IDENTICAL REGRESSION</small><strong>{identicalRegressionPassed ? "PASS" : "NOT RUN"}</strong></div></div>
            <code>{failedRun.regressionCase.id}</code>
          </div>
        )}

        <div className="architecture-note">
          <strong>One verifier, two workflows.</strong>
          <span>UI selection → Effect Contract → WebMCP action → independent state diff</span>
          <span className="live-record-count" aria-hidden="true">{Object.keys(liveSnapshot).length} records observed</span>
        </div>
      </section>

      <section className="benchmark-evidence" aria-labelledby="benchmark-title">
        <div className="benchmark-heading">
          <div>
            <span className="section-kicker">CONTROLLED COMPARISON · TWO SEEDED SCENARIOS</span>
            <h2 id="benchmark-title">What each layer actually checked</h2>
          </div>
          <a href="/baseline.html?scenario=orders&defect=1">Open plain WebMCP fixture →</a>
        </div>
        <div className="benchmark-cards">
          <article>
            <span>WebMCP Evals 0.0.3 matcher</span>
            <strong>2 / 2 calls matched</strong>
            <p>Both collateral defects remained after the matched calls.</p>
          </article>
          <article>
            <span>Evals + manual Playwright</span>
            <strong>4 state assertions</strong>
            <p>Detected both defects; the identical assertions passed after repair.</p>
          </article>
          <article className="benchmark-actionproof">
            <span>ActionProof</span>
            <strong>0 per-record expected-state assertions</strong>
            <p>Two action bindings generated the required and unchanged checks.</p>
          </article>
        </div>
        <p className="benchmark-limit">Measured with native Chrome WebMCP and deterministic fake data. This is a detection-coverage comparison, not a runtime-performance or market-demand claim.</p>
      </section>
    </main>
  );
}
