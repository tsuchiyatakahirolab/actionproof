import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseRegressionArtifact, runRegressionArtifact } from "../src/core/regression";
import { ScenarioStore, scenarioDefinitions } from "../src/core/scenario";
import type { VerificationResult } from "../src/core/types";

type Implementation = "defect" | "repaired";
type ExpectedVerdict = VerificationResult["verdict"];

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main(): Promise<void> {
  const artifactArgument = process.argv[2];
  if (!artifactArgument || artifactArgument.startsWith("--")) {
    throw new Error("Usage: npm run regression:ci -- <artifact.json> [--implementation repaired|defect] [--expect ACTION_PROVEN|FAILED_EFFECT|TOOL_CALL_FAILED]");
  }

  const implementation = (option("--implementation") ?? "repaired") as Implementation;
  const expectedVerdict = (option("--expect") ?? "ACTION_PROVEN") as ExpectedVerdict;
  if (!(["defect", "repaired"] as string[]).includes(implementation)) {
    throw new Error(`Unsupported implementation: ${implementation}`);
  }
  if (!(["ACTION_PROVEN", "FAILED_EFFECT", "TOOL_CALL_FAILED"] as string[]).includes(expectedVerdict)) {
    throw new Error(`Unsupported expected verdict: ${expectedVerdict}`);
  }

  const artifactPath = resolve(process.cwd(), artifactArgument);
  const artifact = parseRegressionArtifact(await readFile(artifactPath, "utf8"));
  const definition = scenarioDefinitions.find((candidate) => candidate.id === artifact.regressionCase.workflowId);
  if (!definition) throw new Error(`No scenario adapter is registered for ${artifact.regressionCase.workflowId}.`);

  const store = new ScenarioStore(definition);
  store.reset(implementation === "defect");
  const result = await runRegressionArtifact({
    artifact,
    store,
    executeTool: async (_name, argumentsRecord) => store.executeMutation(argumentsRecord),
  });

  const summary = {
    schemaVersion: artifact.schemaVersion,
    artifact: artifactArgument,
    regressionId: result.regressionCase.id,
    implementation,
    expectedVerdict,
    actualVerdict: result.verdict,
    requiredMissing: result.requiredMissing.length,
    unexpectedChanges: result.unexpectedChanges.length,
    invariantViolations: result.invariantViolations.length,
    identityMatched: true,
    passed: result.verdict === expectedVerdict,
  };
  process.stdout.write(`${JSON.stringify(summary)}\n`);
  if (!summary.passed) {
    throw new Error(`Expected ${expectedVerdict}, received ${result.verdict}.`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
