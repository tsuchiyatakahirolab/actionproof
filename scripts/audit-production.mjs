import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.PRODUCTION_URL ?? "https://actionproof.vercel.app";
const auditOutput = process.env.AUDIT_OUTPUT
  ? path.resolve(process.env.AUDIT_OUTPUT)
  : path.join(process.cwd(), "submission", "PRODUCTION_AUDIT.json");
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
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
  const socialCardMeta = await page.locator('meta[property="og:image"]').getAttribute("content");
  const socialCardResponse = await fetch(new URL("/og-exactdelta.png", url));
  const socialCard = {
    meta: socialCardMeta,
    assetStatus: socialCardResponse.status,
    contentType: socialCardResponse.headers.get("content-type"),
    pass:
      Boolean(socialCardMeta?.endsWith("/og-exactdelta.png")) &&
      socialCardResponse.ok &&
      socialCardResponse.headers.get("content-type")?.startsWith("image/png") === true,
  };

  for (const workflow of ["orders", "permissions"]) {
    if (workflow === "permissions") {
      await page.getByRole("button", { name: /Permission change/ }).click();
      await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
    }
    const activeTools = await page.evaluate(async () =>
      (await document.modelContext.getTools()).map((tool) => tool.name),
    );
    await page.evaluate(async ({ workflowId }) => {
      const tool = (await document.modelContext.getTools())[0];
      const argumentsRecord = workflowId === "orders"
        ? { order_id: "#1042" }
        : { user_id: "Alice", role: "Editor" };
      await document.modelContext.executeTool(tool, JSON.stringify(argumentsRecord));
    }, { workflowId: workflow });
    await page.getByTestId("verdict-fail").waitFor();
    const failureText = await page.getByTestId("verdict-fail").innerText();
    const invocationPath = await page.getByTestId("invocation-origin").innerText();
    await page.getByTestId("run-fixed").click();
    await page.getByTestId("verdict-pass").waitFor();
    const lifecycleText = await page.getByTestId("regression-proof").innerText();
    workflows.push({
      workflow,
      activeTools,
      externalCallEnteredGate: invocationPath.includes("EXTERNAL WEBMCP CALL"),
      defectDetected: failureText.includes("OBSERVED EFFECT FAILED"),
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
    socialCard,
    permissionsPolicy: headerResponse.headers.get("permissions-policy"),
    consoleErrors,
    pass:
      workflows.every((workflow) =>
        workflow.defectDetected &&
        workflow.externalCallEnteredGate &&
        workflow.identicalRegressionPassed &&
        workflow.activeTools.length === 1 &&
        workflow.activeTools[0] === (workflow.workflow === "orders" ? "cancel_order" : "change_user_role")
      ) &&
      headerResponse.headers.get("permissions-policy") === "tools=*" &&
      socialCard.pass &&
      consoleErrors.length === 0,
  };
  await writeFile(
    auditOutput,
    `${JSON.stringify(output, null, 2)}\n`,
  );
  console.log(JSON.stringify(output, null, 2));
  if (!output.pass) process.exitCode = 1;
} finally {
  await browser.close();
}
