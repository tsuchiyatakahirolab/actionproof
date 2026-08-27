import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.PRODUCTION_URL ?? "https://actionproof.vercel.app";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-features=WebMCP,WebMCPTesting"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

const workflows = [];
try {
  const response = await page.goto(`${url}/?speed=0.01`);
  if (!response?.ok()) throw new Error(`Production page returned ${response?.status()}.`);
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP active" }).waitFor();

  for (const workflow of ["orders", "permissions"]) {
    if (workflow === "permissions") {
      await page.getByRole("button", { name: /Permission change/ }).click();
    }
    await page.getByTestId("run-defect").click();
    await page.getByTestId("verdict-fail").waitFor();
    const failureText = await page.getByTestId("verdict-fail").innerText();
    await page.getByTestId("run-fixed").click();
    await page.getByTestId("verdict-pass").waitFor();
    const lifecycleText = await page.getByTestId("regression-proof").innerText();
    workflows.push({
      workflow,
      defectDetected: failureText.includes("REAL-WORLD EFFECT FAILED"),
      identicalRegressionPassed: lifecycleText.includes("IDENTICAL REGRESSION") && lifecycleText.includes("PASS"),
    });
  }

  const baselineResponse = await page.goto(`${url}/baseline.html?scenario=orders&defect=1`);
  if (!baselineResponse?.ok()) throw new Error(`Baseline page returned ${baselineResponse?.status()}.`);
  await page.getByTestId("baseline-bridge").filter({ hasText: "native-webmcp" }).waitFor();

  const headerResponse = await fetch(url);
  const output = {
    auditedAt: new Date().toISOString(),
    url,
    nativeWebMcp: true,
    workflows,
    baselineNativeWebMcp: true,
    permissionsPolicy: headerResponse.headers.get("permissions-policy"),
    consoleErrors,
    pass:
      workflows.every((workflow) => workflow.defectDetected && workflow.identicalRegressionPassed) &&
      headerResponse.headers.get("permissions-policy") === "tools=*" &&
      consoleErrors.length === 0,
  };
  await writeFile(
    path.join(process.cwd(), "submission", "PRODUCTION_AUDIT.json"),
    `${JSON.stringify(output, null, 2)}\n`,
  );
  console.log(JSON.stringify(output, null, 2));
  if (!output.pass) process.exitCode = 1;
} finally {
  await browser.close();
}
