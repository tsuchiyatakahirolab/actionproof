import { runEffectGate, type Snapshot } from "exactdelta";

let state: Snapshot = {
  "ticket-21": { id: "ticket-21", status: "open", queue: "support" },
  "ticket-22": { id: "ticket-22", status: "open", queue: "support" },
};

const result = await runEffectGate({
  adapter: {
    readIntent: () => ({
      workflowId: "support-tickets",
      resourceLabel: "ticket",
      selectedIds: ["ticket-21"],
      summary: "Close only ticket-21",
      mutation: { field: "status", value: "closed" },
    }),
    readSnapshot: () => structuredClone(state),
  },
  action: {
    toolName: "close_ticket",
    arguments: { ticket_id: "ticket-21" },
    execute: async () => {
      state = structuredClone(state);
      state["ticket-21"].status = "closed";
      return { success: true };
    },
  },
});

const verdict: "ACTION_PROVEN" | "FAILED_EFFECT" | "TOOL_CALL_FAILED" = result.verdict;
void verdict;
