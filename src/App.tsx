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
  const version = useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  return useMemo(() => store.snapshot(), [store, version]);
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
  const definition = store.definition;
  const liveSnapshot = useScenarioSnapshot(store);
  const [displaySnapshot, setDisplaySnapshot] = useState<Snapshot>(() => store.snapshot());
  const [phase, setPhase] = useState<Phase>(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [runHistory, setRunHistory] = useState<VerificationResult[]>([]);
  const [bridge, setBridge] = useState<WebMcpBridge | null>(null);
  const [bridgeMode, setBridgeMode] = useState<BridgeMode | "initializing">("initializing");

  const query = new URLSearchParams(window.location.search);
  const speed = Math.max(
    0.01,
    Number(query.get("speed") ?? "1"),
  );
  const autoplay = query.get("autoplay");
  const demoTiming = query.get("timing") === "demo";
  const autoplayStarted = useRef(false);

  useEffect(() => {
    setBridge(null);
    setBridgeMode("initializing");
    let active = true;
    let installedBridge: WebMcpBridge | null = null;
    const tools: WebMcpTool[] = [{
      name: definition.toolName,
      title: definition.actionLabel,
      description: `${definition.actionLabel}. Use only for the record explicitly selected in the visible UI: ${definition.targetId}. The intended ${definition.mutation.field} is ${String(definition.mutation.value)}.`,
      inputSchema: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(definition.toolArguments).map(([name, value]) => [name, {
            type: typeof value,
            enum: [value],
            description: name === definition.targetArgument
              ? `Must match the record explicitly selected in the visible UI (${definition.targetId}).`
              : `Must match the visible requested value (${String(value)}).`,
          }]),
        ),
        required: Object.keys(definition.toolArguments),
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (argumentsRecord) => store.executeMutation(argumentsRecord),
    }];

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
        if (active) {
          console.error("WebMCP bridge initialization failed", error);
          setBridgeMode("webmcp-compatible-harness");
        }
      });

    return () => {
      active = false;
      installedBridge?.dispose();
    };
  }, [definition, store]);

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

    const phaseDelays = demoTiming
      ? definition.id === "orders" && defectEnabled
        ? [10_000, 10_000, 7_000, 13_000, 5_000]
        : [500, 500, 500, 500, 500]
      : [4_000, 4_000, 3_000, 4_000, 5_000].map((delay) => delay * speed);

    await sleep(phaseDelays[0]);
    setPhase(1);
    await sleep(phaseDelays[1]);

    const proof = await runActionProof({ store, executeTool: bridge.executeTool });
    setResult(proof);
    setRunHistory((history) => [...history, proof]);
    setPhase(2);
    await sleep(phaseDelays[2]);

    setDisplaySnapshot(store.snapshot());
    setPhase(3);
    await sleep(phaseDelays[3]);

    setPhase(4);
    await sleep(phaseDelays[4]);
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
  const gateState = phase < 4 || !currentResult
    ? running ? "running" : "pending"
    : currentResult.verdict === "ACTION_PROVEN"
      ? "passed"
      : "blocked";
  const gateLabel = {
    pending: "EFFECT GATE PENDING",
    running: "EFFECT GATE RUNNING",
    passed: "EFFECT GATE PASSED",
    blocked: "EFFECT GATE BLOCKED",
  }[gateState];

  function downloadRegression(resultToDownload: VerificationResult): void {
    const artifact = {
      schemaVersion: "actionproof.regression.v1",
      generatedAt: new Date().toISOString(),
      regressionCase: resultToDownload.regressionCase,
    };
    const url = URL.createObjectURL(
      new Blob([`${JSON.stringify(artifact, null, 2)}\n`], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resultToDownload.regressionCase.id}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">AP</span>
          <div>
            <strong>ActionProof</strong>
            <span>Pre-release effect gate for WebMCP writes</span>
          </div>
        </div>
        <div className="topbar-badges">
          <span className="badge badge-neutral">Staging release fixture</span>
          <span className="badge badge-neutral">Fake data · no transactions</span>
          <span
            className={`badge ${bridgeMode === "native-webmcp" ? "badge-native" : "badge-harness"}`}
            data-testid="bridge-mode"
          >
            {bridgeMode === "native-webmcp"
              ? "Native WebMCP · 1 context-matched tool"
              : bridgeMode === "initializing"
                ? "Checking WebMCP…"
                : "WebMCP-compatible local harness"}
          </span>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">THE PRE-RELEASE EFFECT GATE FOR WEBMCP WRITES</p>
        <h1>The agent did everything right. <em>The result was still wrong.</em></h1>
        <p>
          Before a state-changing tool ships, ActionProof proves that observed application state matches the human-authorized Effect Contract—and nothing else changed.
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
            <span className="section-kicker">STAGING QA · 20-SECOND SILENT PROOF</span>
            <h2>{definition.intentSummary}</h2>
            <p className="release-question">Release decision: can this WebMCP write tool ship?</p>
          </div>
          <div
            className={`gate-status gate-${gateState}`}
            data-testid="gate-status"
            role="status"
          >
            <span>{gateLabel}</span>
            <small>{gateState === "blocked" ? "Collateral change detected" : gateState === "passed" ? "Exact contract satisfied" : "Awaiting effect evidence"}</small>
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
                <strong>All other state changes</strong>
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
                <strong>Post-action application state</strong>
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
                <div className="ship-decision ship-pass">EFFECT GATE PASSED</div>
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
                <div className="ship-decision ship-blocked">EFFECT GATE BLOCKED</div>
              </div>
            )}
          </aside>
        </div>

        {currentResult && phase >= 4 && (
          <div className="regression-strip" data-testid="regression-strip">
            <div>
              <span>CI REGRESSION ARTIFACT</span>
              <strong>{currentResult.regressionCase.id}</strong>
            </div>
            <p>Same contract · same arguments · reusable as the release gate after repair</p>
            <button
              className="download-regression"
              data-testid="download-regression"
              onClick={() => downloadRegression(currentResult)}
              type="button"
            >
              Download CI regression
            </button>
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
          <strong>One release gate, two workflows.</strong>
          <span>UI selection → Effect Contract → context-matched WebMCP action → application-state diff</span>
          <span className="live-record-count" aria-hidden="true">{Object.keys(liveSnapshot).length} records observed</span>
        </div>
      </section>

      <section className="benchmark-evidence" aria-labelledby="benchmark-title">
        <div className="benchmark-heading">
          <div>
            <span className="section-kicker">CONTROLLED COMPARISON · TWO SEEDED SCENARIOS</span>
            <h2 id="benchmark-title">Why a correct call still needs an effect gate</h2>
          </div>
          <a href="/baseline.html?scenario=orders&defect=1">Open plain WebMCP fixture →</a>
        </div>
        <div className="benchmark-cards">
          <article>
            <span>WebMCP Evals 0.0.3 matcher</span>
            <strong>2 / 2 correct calls matched</strong>
            <p>2/2 wrong-argument controls failed; both effect defects remained.</p>
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
