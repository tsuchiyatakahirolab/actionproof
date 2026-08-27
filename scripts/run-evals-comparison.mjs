import { chromium } from "@playwright/test";
import { evaluateExecutionTrajectory } from "webmcp-evals/dist/utils.js";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packageMetadata = JSON.parse(
  await readFile(path.join(root, "node_modules", "webmcp-evals", "package.json"), "utf8"),
);

const cases = [
  {
    id: "orders",
    file: "orders.json",
    targetTestId: "record-1042",
    neighborTestId: "record-1043",
    field: "status",
    expectedTarget: "cancelled",
    expectedNeighbor: "active",
  },
  {
    id: "permissions",
    file: "permissions.json",
    targetTestId: "record-Alice",
    neighborTestId: "record-Bob",
    field: "role",
    expectedTarget: "Editor",
    expectedNeighbor: "Viewer",
  },
];

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-features=WebMCP,WebMCPTesting"],
});

const results = [];
try {
  for (const benchmarkCase of cases) {
    const suite = JSON.parse(
      await readFile(path.join(root, "benchmarks", "evals", benchmarkCase.file), "utf8"),
    );
    const expected = suite[0].expectedCall;
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:4175/baseline.html?scenario=${benchmarkCase.id}&defect=1`);
    await page.getByTestId("baseline-bridge").waitFor();
    const mode = await page.getByTestId("baseline-bridge").textContent();
    if (mode !== "native-webmcp") throw new Error(`Native WebMCP unavailable for ${benchmarkCase.id}: ${mode}`);

    const actual = expected.map((call) => ({
      functionName: call.functionName,
      args: call.arguments,
    }));

    await page.evaluate(async ({ functionName, args }) => {
      const context = document.modelContext;
      const tools = await context.getTools();
      const tool = tools.find((candidate) => candidate.name === functionName);
      if (!tool) throw new Error(`Missing native tool ${functionName}`);
      await context.executeTool(tool, JSON.stringify(args));
    }, actual[0]);

    const trajectory = evaluateExecutionTrajectory(expected, actual);
    const targetActual = await page
      .locator(`[data-testid="${benchmarkCase.targetTestId}"] [data-field="${benchmarkCase.field}"]`)
      .textContent();
    const neighborActual = await page
      .locator(`[data-testid="${benchmarkCase.neighborTestId}"] [data-field="${benchmarkCase.field}"]`)
      .textContent();

    results.push({
      scenario: benchmarkCase.id,
      bridgeMode: mode,
      officialMatcherOutcome: trajectory.every((item) => item.outcome === "pass") ? "PASS" : "FAIL",
      expectedCall: expected,
      actualCall: actual,
      observedState: {
        target: { expected: benchmarkCase.expectedTarget, actual: targetActual },
        unselectedNeighbor: { expected: benchmarkCase.expectedNeighbor, actual: neighborActual },
      },
      collateralDefectPresent: neighborActual !== benchmarkCase.expectedNeighbor,
    });
    await page.close();
  }
} finally {
  await browser.close();
}

const output = {
  measuredAt: new Date().toISOString(),
  method: "Native Chrome WebMCP execution scored by the official webmcp-evals trajectory matcher; state read independently after the call.",
  webmcpEvalsVersion: packageMetadata.version,
  results,
};

await mkdir(path.join(root, "benchmarks", "results"), { recursive: true });
await writeFile(
  path.join(root, "benchmarks", "results", "evals-comparison.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

if (!results.every((result) => result.officialMatcherOutcome === "PASS" && result.collateralDefectPresent)) {
  throw new Error("The controlled Evals comparison did not reproduce the expected call/effect gap.");
}

console.log(JSON.stringify(output, null, 2));
