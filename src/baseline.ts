import { ScenarioStore, scenarioDefinitions } from "./core/scenario";
import type { Scalar } from "./core/types";
import {
  createWebMcpBridge,
  type WebMcpBridge,
  type WebMcpTool,
} from "./webmcp/bridge";
import "./baseline.css";

function requireRoot(): HTMLDivElement {
  const element = document.querySelector<HTMLDivElement>("#baseline-root");
  if (!element) throw new Error("Baseline root is missing.");
  return element;
}

const root = requireRoot();

const query = new URLSearchParams(window.location.search);
const scenarioId = query.get("scenario") === "permissions" ? "permissions" : "orders";
const defectEnabled = query.get("defect") !== "0";
const definition = scenarioDefinitions.find((candidate) => candidate.id === scenarioId)!;
const store = new ScenarioStore(definition);
store.reset(defectEnabled);

let bridge: WebMcpBridge | null = null;

function render(mode = bridge?.mode ?? "initializing") {
  const rows = Object.values(store.snapshot())
    .map(
      (record) => `
        <tr data-testid="record-${record.id.replace(/[^a-zA-Z0-9]/g, "")}">
          <td>${record.id}</td>
          ${definition.columns.map((column) => `<td data-field="${column.field}">${String(record[column.field])}</td>`).join("")}
        </tr>`,
    )
    .join("");

  root.innerHTML = `
    <main>
      <p class="fixture-label">COMPARISON FIXTURE · FAKE DATA · SEEDED DEFECT: ${defectEnabled ? "ON" : "OFF"}</p>
      <h1>Plain WebMCP action page</h1>
      <p>This page intentionally has no Effect Contract or ExactDelta verifier.</p>
      <dl>
        <div><dt>Visible intent</dt><dd>${definition.intentSummary}</dd></div>
        <div><dt>Registered tool</dt><dd><code>${definition.toolName}(${JSON.stringify(definition.toolArguments)})</code></dd></div>
        <div><dt>Bridge</dt><dd data-testid="baseline-bridge">${mode}</dd></div>
      </dl>
      <button type="button" data-testid="baseline-run" ${bridge ? "" : "disabled"}>Execute the correct WebMCP call</button>
      <table>
        <thead><tr><th>ID</th>${definition.columns.map((column) => `<th>${column.label}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <output data-testid="baseline-result">Not run</output>
    </main>`;

  root.querySelector<HTMLButtonElement>("[data-testid=baseline-run]")?.addEventListener("click", async () => {
    if (!bridge) return;
    const result = await bridge.executeTool(definition.toolName, definition.toolArguments);
    render(bridge.mode);
    const output = root.querySelector<HTMLOutputElement>("[data-testid=baseline-result]");
    if (output) output.textContent = JSON.stringify(result);
  });
}

store.subscribe(() => render());

const tool: WebMcpTool = {
  name: definition.toolName,
  title: definition.actionLabel,
  description: `${definition.actionLabel} for the visible selected record.`,
  inputSchema: {
    type: "object",
    properties: Object.fromEntries(
      Object.entries(definition.toolArguments).map(([name, value]) => [name, { type: typeof value }]),
    ),
    required: Object.keys(definition.toolArguments),
    additionalProperties: false,
  },
  annotations: { readOnlyHint: false, untrustedContentHint: false },
  execute: async (argumentsRecord: Record<string, Scalar>) => store.executeMutation(argumentsRecord),
};

render();
createWebMcpBridge([tool])
  .then((createdBridge) => {
    bridge = createdBridge;
    render(createdBridge.mode);
  })
  .catch((error: unknown) => {
    console.error("Baseline WebMCP bridge initialization failed", error);
    render("initialization-failed");
  });

window.addEventListener("beforeunload", () => bridge?.dispose());
