import { describe, expect, it } from "vitest";
import { createRegressionArtifact, runRegressionWithAdapter } from "./regression";
import { runEffectGate } from "./gate";
import type { EntityRecord, ExplicitIntent, Snapshot } from "./types";

function createOwnedApp(defectEnabled: boolean) {
  const initial: EntityRecord[] = [
    { id: "job-7", status: "queued", owner: "ops" },
    { id: "job-8", status: "queued", owner: "ops" },
  ];
  let records: Snapshot = {};
  const reset = () => {
    records = Object.fromEntries(initial.map((record) => [record.id, { ...record }]));
  };
  reset();

  const intent: ExplicitIntent = {
    workflowId: "external-jobs",
    resourceLabel: "job",
    selectedIds: ["job-7"],
    summary: "Start only job-7",
    mutation: { field: "status", value: "running" },
  };
  const toolArguments = { job_id: "job-7" };

  return {
    reset,
    adapter: {
      workflowId: intent.workflowId,
      toolName: "start_job",
      prepare: () => reset(),
      readIntent: () => structuredClone(intent),
      readToolArguments: () => structuredClone(toolArguments),
      readSnapshot: () => structuredClone(records),
      executeTool: async (name: string, args: Record<string, string | number | boolean | null>) => {
        if (name !== "start_job" || args.job_id !== "job-7") {
          throw new Error("Unexpected external tool call.");
        }
        records["job-7"].status = "running";
        if (defectEnabled) records["job-8"].status = "running";
        return { success: true };
      },
    },
  };
}

describe("public Effect Gate adapter", () => {
  it("detects a collateral write without ScenarioStore", async () => {
    const { adapter } = createOwnedApp(true);
    const result = await runEffectGate({
      adapter,
      action: {
        toolName: adapter.toolName,
        arguments: adapter.readToolArguments(),
        execute: adapter.executeTool,
      },
    });

    expect(result.toolCall.status).toBe("PASSED");
    expect(result.verdict).toBe("FAILED_EFFECT");
    expect(result.unexpectedChanges).toEqual([
      { entityId: "job-8", field: "status", before: "queued", after: "running" },
    ]);
  });

  it("replays the exported artifact through a repaired external adapter", async () => {
    const defective = createOwnedApp(true);
    const failure = await runEffectGate({
      adapter: defective.adapter,
      action: {
        toolName: defective.adapter.toolName,
        arguments: defective.adapter.readToolArguments(),
        execute: defective.adapter.executeTool,
      },
    });
    const artifact = createRegressionArtifact(failure, "2026-09-03T00:00:00.000Z");
    const repaired = createOwnedApp(false);

    const result = await runRegressionWithAdapter({
      artifact,
      adapter: repaired.adapter,
    });

    expect(result.verdict).toBe("ACTION_PROVEN");
    expect(result.regressionCase.id).toBe(artifact.regressionCase.id);
  });

  it("rejects consumer argument drift before invoking the write", async () => {
    const defective = createOwnedApp(true);
    const failure = await runEffectGate({
      adapter: defective.adapter,
      action: {
        toolName: defective.adapter.toolName,
        arguments: defective.adapter.readToolArguments(),
        execute: defective.adapter.executeTool,
      },
    });
    const artifact = createRegressionArtifact(failure, "2026-09-03T00:00:00.000Z");
    const repaired = createOwnedApp(false);
    let writes = 0;

    await expect(runRegressionWithAdapter({
      artifact,
      adapter: {
        ...repaired.adapter,
        readToolArguments: () => ({ job_id: "job-8" }),
        executeTool: async (name, args) => {
          writes += 1;
          return repaired.adapter.executeTool(name, args);
        },
      },
    })).rejects.toThrow("tool arguments no longer match");

    expect(writes).toBe(0);
  });
});
