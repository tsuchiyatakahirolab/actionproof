import { describe, expect, it, vi } from "vitest";
import {
  createRegressionArtifact,
  parseRegressionArtifact,
  runRegressionArtifact,
} from "./regression";
import { runExactDelta, ScenarioStore, scenarioDefinitions } from "./scenario";

const orders = scenarioDefinitions.find((definition) => definition.id === "orders")!;

async function capturedOrdersArtifact() {
  const store = new ScenarioStore(orders);
  store.reset(true);
  const result = await runExactDelta({
    store,
    executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
  });
  return createRegressionArtifact(result, "2026-08-28T00:00:00.000Z");
}

describe("ExactDelta regression artifacts", () => {
  it("round-trips the versioned JSON schema", async () => {
    const artifact = await capturedOrdersArtifact();
    expect(parseRegressionArtifact(JSON.stringify(artifact))).toEqual(artifact);
  });

  it("re-executes one loaded artifact against defect and repair", async () => {
    const artifact = await capturedOrdersArtifact();
    const defectStore = new ScenarioStore(orders);
    defectStore.reset(true);
    const defect = await runRegressionArtifact({
      artifact,
      store: defectStore,
      executeTool: async (_name, argumentsRecord) => defectStore.executeMutation(argumentsRecord),
    });

    const repairedStore = new ScenarioStore(orders);
    repairedStore.reset(false);
    const repaired = await runRegressionArtifact({
      artifact,
      store: repairedStore,
      executeTool: async (_name, argumentsRecord) => repairedStore.executeMutation(argumentsRecord),
    });

    expect(defect.verdict).toBe("FAILED_EFFECT");
    expect(repaired.verdict).toBe("ACTION_PROVEN");
    expect(defect.regressionCase).toEqual(repaired.regressionCase);
  });

  it("rejects contract drift before invoking the write", async () => {
    const artifact = await capturedOrdersArtifact();
    artifact.regressionCase.contract.required[0].expected = "deleted";
    const executeTool = vi.fn();
    const store = new ScenarioStore(orders);
    store.reset(false);

    await expect(runRegressionArtifact({ artifact, store, executeTool }))
      .rejects.toThrow("generated Effect Contract no longer matches the artifact");
    expect(executeTool).not.toHaveBeenCalled();
  });

  it("rejects regression identity drift before invoking the write", async () => {
    const artifact = await capturedOrdersArtifact();
    artifact.regressionCase.id = "tampered-id";
    const executeTool = vi.fn();
    const store = new ScenarioStore(orders);
    store.reset(false);

    await expect(runRegressionArtifact({ artifact, store, executeTool }))
      .rejects.toThrow("regression ID no longer matches the recorded intent");
    expect(executeTool).not.toHaveBeenCalled();
  });

  it("rejects malformed or unsupported artifact input", () => {
    expect(() => parseRegressionArtifact({ schemaVersion: "exactdelta.regression.v0" }))
      .toThrow("schemaVersion must be exactdelta.regression.v1");
  });
});
