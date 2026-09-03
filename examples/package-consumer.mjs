import {
  createRegressionArtifact,
  runEffectGate,
  runRegressionWithAdapter,
} from "exactdelta";

const initial = {
  "ticket-21": { id: "ticket-21", status: "open", queue: "support" },
  "ticket-22": { id: "ticket-22", status: "open", queue: "support" },
};

function createSupportApp(defectEnabled) {
  let state = structuredClone(initial);
  const intent = {
    workflowId: "support-tickets",
    resourceLabel: "ticket",
    selectedIds: ["ticket-21"],
    summary: "Close only ticket-21",
    mutation: { field: "status", value: "closed" },
  };

  return {
    workflowId: intent.workflowId,
    toolName: "close_ticket",
    prepare: () => { state = structuredClone(initial); },
    readIntent: () => structuredClone(intent),
    readToolArguments: () => ({ ticket_id: "ticket-21" }),
    readSnapshot: () => structuredClone(state),
    executeTool: async (name, argumentsRecord) => {
      if (name !== "close_ticket" || argumentsRecord.ticket_id !== "ticket-21") {
        throw new Error("Unexpected support-ticket tool call.");
      }
      state["ticket-21"].status = "closed";
      if (defectEnabled) state["ticket-22"].status = "closed";
      return { success: true };
    },
  };
}

const defective = createSupportApp(true);

const failure = await runEffectGate({
  adapter: defective,
  action: {
    toolName: defective.toolName,
    arguments: defective.readToolArguments(),
    execute: defective.executeTool,
  },
});

if (failure.verdict !== "FAILED_EFFECT" || failure.unexpectedChanges.length !== 1) {
  throw new Error(`Installed consumer did not detect the collateral write: ${failure.verdict}`);
}

const artifact = createRegressionArtifact(failure, "2026-09-03T00:00:00.000Z");
const repaired = createSupportApp(false);
const replay = await runRegressionWithAdapter({ artifact, adapter: repaired });

if (replay.verdict !== "ACTION_PROVEN" || replay.regressionCase.id !== artifact.regressionCase.id) {
  throw new Error(`Installed consumer regression failed: ${replay.verdict}`);
}

console.log("EXACTDELTA_PACKAGE_SMOKE FAILED_EFFECT -> IDENTICAL ACTION_PROVEN");
