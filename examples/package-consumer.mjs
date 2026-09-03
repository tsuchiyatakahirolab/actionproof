import { runEffectGate } from "../package-dist/exactdelta.js";

const initial = {
  "ticket-21": { id: "ticket-21", status: "open", queue: "support" },
  "ticket-22": { id: "ticket-22", status: "open", queue: "support" },
};
let state = structuredClone(initial);

const adapter = {
  readIntent: () => ({
    workflowId: "support-tickets",
    resourceLabel: "ticket",
    selectedIds: ["ticket-21"],
    summary: "Close only ticket-21",
    mutation: { field: "status", value: "closed" },
  }),
  readSnapshot: () => structuredClone(state),
};

const result = await runEffectGate({
  adapter,
  action: {
    toolName: "close_ticket",
    arguments: { ticket_id: "ticket-21" },
    execute: async () => {
      state["ticket-21"].status = "closed";
      return { success: true };
    },
  },
});

if (result.verdict !== "ACTION_PROVEN") {
  throw new Error(`Package consumer smoke failed: ${result.verdict}`);
}

console.log(`EXACTDELTA_PACKAGE_SMOKE ${result.verdict}`);
