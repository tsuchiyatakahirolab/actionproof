import { describe, expect, it } from "vitest";
import {
  runActionProof,
  ScenarioStore,
  scenarioDefinitions,
} from "./scenario";

const orders = scenarioDefinitions[0];
const permissions = scenarioDefinitions[1];

describe("ActionProof effect verification", () => {
  it("passes a correct single-target action", async () => {
    const store = new ScenarioStore(orders);
    store.reset(false);

    const result = await runActionProof({
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

    const result = await runActionProof({
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
    const result = await runActionProof({
      store,
      executeTool: async () => {
        throw new Error("Injected transport failure");
      },
    });

    expect(result.verdict).toBe("TOOL_CALL_FAILED");
    expect(result.effectStatus).toBe("NOT_EVALUATED");
    expect(result.observedChanges).toHaveLength(0);
  });

  it("uses the identical verifier for the permission workflow", async () => {
    const store = new ScenarioStore(permissions);
    store.reset(true);

    const result = await runActionProof({
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

  it.each(scenarioDefinitions)(
    "retains the identical generated regression for defect and repair: $id",
    async (definition) => {
      const store = new ScenarioStore(definition);
      store.reset(true);
      const failure = await runActionProof({
        store,
        executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
      });

      store.reset(false);
      const repaired = await runActionProof({
        store,
        executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
      });

      expect(failure.verdict).toBe("FAILED_EFFECT");
      expect(repaired.verdict).toBe("ACTION_PROVEN");
      expect(repaired.regressionCase).toEqual(failure.regressionCase);
    },
  );
});
