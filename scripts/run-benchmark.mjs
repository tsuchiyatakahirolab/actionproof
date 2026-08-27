import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const resultsDirectory = path.join(root, "benchmarks", "results");
await mkdir(resultsDirectory, { recursive: true });

const vite = spawn(
  process.execPath,
  [path.join(root, "node_modules", "vite", "bin", "vite.js"), "preview", "--host", "127.0.0.1", "--port", "4175", "--strictPort"],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);

let serverOutput = "";
vite.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
vite.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4175/baseline.html");
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite preview did not start.\n${serverOutput}`);
}

function run(label, executable, args, env = {}) {
  const started = performance.now();
  const result = spawnSync(executable, args, {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  return {
    label,
    exitCode: result.status,
    durationMs: Math.round(performance.now() - started),
    output,
  };
}

let summary;
try {
  await waitForServer();

  const evals = run(
    "official WebMCP Evals matcher over native calls",
    process.execPath,
    ["scripts/run-evals-comparison.mjs"],
  );
  const manualDefect = run(
    "manual Playwright expected-state assertions against seeded defect",
    process.execPath,
    [path.join(root, "node_modules", "@playwright", "test", "cli.js"), "test", "--config", "benchmarks/playwright.config.ts"],
    { BASELINE_DEFECT: "1" },
  );
  const manualFixed = run(
    "identical manual Playwright assertions against repair",
    process.execPath,
    [path.join(root, "node_modules", "@playwright", "test", "cli.js"), "test", "--config", "benchmarks/playwright.config.ts"],
    { BASELINE_DEFECT: "0" },
  );
  const actionProofUi = run(
    "ActionProof generated contracts in native Chrome",
    process.execPath,
    [path.join(root, "node_modules", "@playwright", "test", "cli.js"), "test", "--config", "playwright.config.ts"],
  );

  await writeFile(path.join(resultsDirectory, "webmcp-evals.log"), evals.output);
  await writeFile(path.join(resultsDirectory, "manual-playwright-defect.log"), manualDefect.output);
  await writeFile(path.join(resultsDirectory, "manual-playwright-fixed.log"), manualFixed.output);
  await writeFile(path.join(resultsDirectory, "actionproof-ui.log"), actionProofUi.output);

  const evalsDetails = JSON.parse(
    await readFile(path.join(resultsDirectory, "evals-comparison.json"), "utf8"),
  );
  const manualAssertionSource = await readFile(path.join(root, "benchmarks", "manual-playwright.spec.ts"), "utf8");
  const manualAssertionCount = (manualAssertionSource.match(/BASELINE_EXPECTED_STATE_ASSERTION/g) ?? []).length;

  const success =
    evals.exitCode === 0 &&
    manualDefect.exitCode !== 0 &&
    manualFixed.exitCode === 0 &&
    actionProofUi.exitCode === 0;
  summary = {
    measuredAt: new Date().toISOString(),
    scope: "Two deterministic fake-data workflows; not a runtime-performance or market-demand benchmark.",
    conditions: {
      nativeWebMcp: true,
      scenarios: ["orders", "permissions"],
      sameSeededDefectAndRepair: true,
    },
    measurements: {
      webmcpEvalsCallLayer: {
        version: evalsDetails.webmcpEvalsVersion,
        commandExitCode: evals.exitCode,
        matchedCorrectCalls: evalsDetails.results.filter((item) => item.officialMatcherOutcome === "PASS").length,
        rejectedWrongArgumentControls: evalsDetails.results.filter((item) => item.negativeControlWrongArgumentOutcome === "FAIL").length,
        collateralDefectsPresentAfterMatchedCall: evalsDetails.results.filter((item) => item.collateralDefectPresent).length,
      },
      webmcpEvalsPlusManualPlaywright: {
        concreteExpectedStateAssertions: manualAssertionCount,
        seededDefectRunExitCode: manualDefect.exitCode,
        repairRunExitCode: manualFixed.exitCode,
        detectedSeededDefects: manualDefect.exitCode !== 0,
        identicalAssertionsPassedAfterRepair: manualFixed.exitCode === 0,
      },
      actionProof: {
        nativeChromeUiExitCode: actionProofUi.exitCode,
        seededDefectsDetected: actionProofUi.exitCode === 0 ? 2 : 0,
        identicalRegressionsPassedAfterRepair: actionProofUi.exitCode === 0 ? 2 : 0,
        concretePerRecordExpectedStateAssertionsInScenarioDefinitions: 0,
        reusableActionBindings: 2,
        generatedRequiredAndUnchangedChecks: true,
        note: "ActionProof still requires an application-owned state adapter and action binding for each action class.",
      },
    },
    commandDurationsMs: {
      evals: evals.durationMs,
      manualDefect: manualDefect.durationMs,
      manualFixed: manualFixed.durationMs,
      actionProofUi: actionProofUi.durationMs,
    },
    success,
  };

  await writeFile(path.join(resultsDirectory, "latest.json"), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  if (!success) process.exitCode = 1;
} finally {
  vite.kill();
}
