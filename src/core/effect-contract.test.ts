import { describe, expect, it } from "vitest";
import { generateEffectContract, verifyEffect } from "./effect-contract";
import {
  runExactDelta,
  ScenarioStore,
  scenarioDefinitions,
} from "./scenario";

const orders = scenarioDefinitions[0];
const permissions = scenarioDefinitions[1];

describe("ExactDelta effect verification", () => {
  it("passes a correct single-target action", async () => {
    const store = new ScenarioStore(orders);
    store.reset(false);

    const result = await runExactDelta({
      store,
      executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
    });

    expect(result.verdict).toBe("ACTION_PROVEN");
    expect(result.requiredSatisfied).toHaveLength(1);
    expect(result.unexpectedChanges).toHaveLength(0);
  });

  it("fails when a successful single-target call causes collateral mutation", async () => {
    const store = new ScenarioStore(orders);
    store.reset(true);

    const result = await runExactDelta({
      store,
      executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
    });

    expect(result.toolCall.status).toBe("PASSED");
    expect(result.verdict).toBe("FAILED_EFFECT");
    expect(result.unexpectedChanges).toEqual([
      expect.objectContaining({ entityId: "#1043", field: "status", after: "cancelled" }),
    ]);
  });

  it("distinguishes tool-call failure from a failed real-world effect", async () => {
    const store = new ScenarioStore(orders);
    const result = await runExactDelta({
      store,
      executeTool: async () => {
        throw new Error("Injected transport failure");
      },
    });

    expect(result.verdict).toBe("TOOL_CALL_FAILED");
    expect(result.effectStatus).toBe("NOT_EVALUATED");
    expect(result.observedChanges).toHaveLength(0);
  });

  it("records and validates the actual arguments received from an external client", async () => {
    const store = new ScenarioStore(orders);
    const received = { order_id: "#1043" };

    const result = await runExactDelta({
      store,
      toolArguments: received,
      executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
    });

    expect(result.toolCall.arguments).toEqual(received);
    expect(result.toolCall.status).toBe("FAILED");
    expect(result.toolCall.error).toContain("does not match the visible selection #1042");
    expect(result.verdict).toBe("TOOL_CALL_FAILED");
  });

  it("uses the identical verifier for the permission workflow", async () => {
    const store = new ScenarioStore(permissions);
    store.reset(true);

    const result = await runExactDelta({
      store,
      executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
    });

    expect(result.contract.source).toBe("explicit-ui-selection+pre-action-state");
    expect(result.contract.required).toEqual([
      expect.objectContaining({ entityId: "Alice", field: "role", expected: "Editor" }),
    ]);
    expect(result.unexpectedChanges).toEqual([
      expect.objectContaining({ entityId: "Bob", field: "role", after: "Editor" }),
    ]);
  });

  it("rejects a mutation value that differs from visible intent before side effects", async () => {
    const store = new ScenarioStore(permissions);
    store.reset(false);

    const result = await runExactDelta({
      store,
      executeTool: async (_name, argumentsRecord) =>
        store.executeMutation({ ...argumentsRecord, role: "Admin" }),
    });

    expect(result.toolCall.status).toBe("FAILED");
    expect(result.verdict).toBe("TOOL_CALL_FAILED");
    expect(result.toolCall.error).toContain("does not match the visible intent Editor");
    expect(result.observedChanges).toEqual([]);
  });

  it("fails closed when the WebMCP action exceeds its timeout", async () => {
    const store = new ScenarioStore(orders);
    let observedSignal: AbortSignal | undefined;
    const result = await runExactDelta({
      store,
      executeTool: async (_name, _arguments, options) => {
        observedSignal = options?.signal;
        return new Promise(() => undefined);
      },
      timeoutMs: 5,
    });

    expect(result.verdict).toBe("TOOL_CALL_FAILED");
    expect(result.toolCall.error).toBe("WebMCP action timed out after 5 ms.");
    expect(observedSignal?.aborted).toBe(true);
  });

  it("does not prove a repeated action when the required transition no longer occurs", async () => {
    const store = new ScenarioStore(orders);
    store.reset(false);

    const first = await runExactDelta({
      store,
      executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
    });
    const repeated = await runExactDelta({
      store,
      executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
    });

    expect(first.verdict).toBe("ACTION_PROVEN");
    expect(repeated.verdict).toBe("FAILED_EFFECT");
    expect(repeated.observedChanges).toEqual([]);
    expect(repeated.requiredMissing).toHaveLength(1);
  });

  it("blocks a tool failure that happened after state was already mutated", async () => {
    const store = new ScenarioStore(orders);
    store.reset(true);

    const result = await runExactDelta({
      store,
      executeTool: async (_name, argumentsRecord) => {
        store.executeMutation(argumentsRecord);
        throw new Error("Injected failure after mutation");
      },
    });

    expect(result.verdict).toBe("TOOL_CALL_FAILED");
    expect(result.effectStatus).toBe("FAILED");
    expect(result.observedChanges).toHaveLength(2);
    expect(result.unexpectedChanges).toEqual([
      expect.objectContaining({ entityId: "#1043", field: "status" }),
    ]);
  });

  it("does not invoke the mutation when the browser client has already aborted", async () => {
    const store = new ScenarioStore(orders);
    const controller = new AbortController();
    controller.abort();
    let invoked = false;

    const result = await runExactDelta({
      store,
      signal: controller.signal,
      executeTool: async () => {
        invoked = true;
      },
    });

    expect(invoked).toBe(false);
    expect(result.verdict).toBe("TOOL_CALL_FAILED");
    expect(result.toolCall.error).toBe("WebMCP action aborted by the client.");
    expect(result.observedChanges).toEqual([]);
  });

  it("does not confuse entity and field names containing the old key delimiter", () => {
    const before = {
      "a:b": { id: "a:b", c: "old" },
      a: { id: "a", "b:c": "safe" },
    };
    const intent = {
      workflowId: "delimiter-test",
      resourceLabel: "record",
      selectedIds: ["a:b"],
      summary: "Change only a:b.c",
      mutation: { field: "c", value: "new" },
    };
    const contract = generateEffectContract(intent, before);
    const after = {
      "a:b": { id: "a:b", c: "new" },
      a: { id: "a", "b:c": "changed" },
    };

    const result = verifyEffect({
      intent,
      contract,
      before,
      after,
      toolCall: {
        name: "change_record",
        arguments: {},
        status: "PASSED",
      },
    });

    expect(result.verdict).toBe("FAILED_EFFECT");
    expect(result.unexpectedChanges).toEqual([
      expect.objectContaining({ entityId: "a", field: "b:c" }),
    ]);
  });

  it("rejects ambiguous selection and malformed identity inputs", () => {
    const store = new ScenarioStore(orders);
    const before = store.snapshot();
    const intent = store.explicitIntent();

    expect(() => generateEffectContract(
      { ...intent, selectedIds: ["#1042", "#1042"] },
      before,
    )).toThrow("duplicate entity IDs");
    expect(() => generateEffectContract(
      { ...intent, mutation: { field: "id", value: "#9999" } },
      before,
    )).toThrow("identity cannot be used as a mutable effect field");
    expect(() => generateEffectContract(intent, {
      ...before,
      "#1042": { ...before["#1042"], id: "#9999" },
    })).toThrow("does not match record identity");
  });

  it("detects entity creation, removal, and extra fields as forbidden deltas", () => {
    const store = new ScenarioStore(orders);
    const before = store.snapshot();
    const intent = store.explicitIntent();
    const contract = generateEffectContract(intent, before);
    const toolCall = {
      name: orders.toolName,
      arguments: orders.toolArguments,
      status: "PASSED" as const,
    };

    const created = verifyEffect({
      intent,
      contract,
      before,
      after: {
        ...before,
        "#1042": { ...before["#1042"], status: "cancelled" },
        "#1044": { id: "#1044", customer: "New record", status: "active" },
      },
      toolCall,
    });
    expect(created.verdict).toBe("FAILED_EFFECT");
    expect(created.invariantViolations).toContain("Entity count changed from 2 to 3.");
    expect(created.invariantViolations).toContain("Entity identity set changed.");

    const { "#1043": _removed, ...withoutNeighbor } = before;
    const removed = verifyEffect({
      intent,
      contract,
      before,
      after: {
        ...withoutNeighbor,
        "#1042": { ...before["#1042"], status: "cancelled" },
      },
      toolCall,
    });
    expect(removed.verdict).toBe("FAILED_EFFECT");
    expect(removed.invariantViolations).toContain("Entity count changed from 2 to 1.");
    expect(removed.invariantViolations).toContain("Entity identity set changed.");

    const extraField = verifyEffect({
      intent,
      contract,
      before,
      after: {
        ...before,
        "#1042": {
          ...before["#1042"],
          status: "cancelled",
          auditMarker: "unexpected",
        },
      },
      toolCall,
    });
    expect(extraField.verdict).toBe("FAILED_EFFECT");
    expect(extraField.unexpectedChanges).toEqual([
      expect.objectContaining({ entityId: "#1042", field: "auditMarker" }),
    ]);
  });

  it.each(scenarioDefinitions)(
    "retains the identical generated regression for defect and repair: $id",
    async (definition) => {
      const store = new ScenarioStore(definition);
      store.reset(true);
      const failure = await runExactDelta({
        store,
        executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
      });

      store.reset(false);
      const repaired = await runExactDelta({
        store,
        executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
      });

      expect(failure.verdict).toBe("FAILED_EFFECT");
      expect(repaired.verdict).toBe("ACTION_PROVEN");
      expect(repaired.regressionCase).toEqual(failure.regressionCase);
      expect(failure.regressionCase.id).toContain(
        `__to-${String(definition.mutation.value).toLowerCase()}`,
      );
    },
  );
});
