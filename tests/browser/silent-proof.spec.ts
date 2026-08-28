import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("the seeded defect is silently legible and the repaired run passes", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/?speed=0.01");
  await expect(page.getByTestId("bridge-mode")).toContainText("Native WebMCP · 1 context-matched tool");
  await expect.poll(() => page.evaluate(async () =>
    (await document.modelContext!.getTools()).map((tool) => tool.name),
  )).toEqual(["cancel_order"]);
  const orderTool = await page.evaluate(async () => {
    const tool = (await document.modelContext!.getTools())[0];
    const schema = typeof tool.inputSchema === "string"
      ? JSON.parse(tool.inputSchema)
      : tool.inputSchema;
    return { origin: tool.origin, schema };
  });
  expect(orderTool.origin).toBe("http://127.0.0.1:4173");
  expect(orderTool.schema.properties.order_id.enum).toEqual(["#1042"]);
  expect(orderTool.schema.additionalProperties).toBe(false);
  await expect(page.getByRole("heading", { name: "The agent did everything right. The result was still wrong." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cancel only Order #1042" })).toBeVisible();
  await expect(page.getByText("Release decision: can this WebMCP write tool ship?")).toBeVisible();
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE PENDING");
  await expect(page.getByTestId("effect-contract")).toContainText("#1042.status → cancelled");
  await expect(page.getByText("Correct WebMCP call")).toBeVisible();

  await page.getByTestId("run-defect").click();
  await expect(page.getByTestId("verdict-fail")).toBeVisible();
  await expect(page.getByText("TOOL CALL PASSED")).toBeVisible();
  await expect(page.getByText("REAL-WORLD EFFECT FAILED")).toBeVisible();
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE BLOCKED");
  await expect(page.getByTestId("state-gap")).toHaveText("REQUESTED 1 · CHANGED 2");
  await expect(page.getByText("UNEXPECTED", { exact: true })).toBeVisible();
  await expect(page.getByTestId("regression-strip")).toContainText("orders__1042__status__to-cancelled");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("download-regression").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("orders__1042__status__to-cancelled.json");
  const downloadedArtifact = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(downloadedArtifact.schemaVersion).toBe("exactdelta.regression.v1");
  expect(downloadedArtifact.regressionCase.id).toBe("orders__1042__status__to-cancelled");
  expect(downloadedArtifact.regressionCase.contract.invariants.exactChangeSet).toBe(true);

  await expect(page.getByTestId("run-fixed")).toBeEnabled();
  await page.getByTestId("run-fixed").click();
  await expect(page.getByTestId("verdict-pass")).toBeVisible();
  await expect(page.getByText("ACTION PROVEN")).toBeVisible();
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE PASSED");
  await expect(page.getByTestId("regression-proof")).toContainText("IDENTICAL REGRESSION");
  await expect(page.getByTestId("regression-proof")).toContainText("PASS");

  expect(consoleErrors).toEqual([]);
});

test("an external browser-agent call enters the same effect gate", async ({ page }) => {
  await page.goto("/?speed=0.01");
  await expect(page.getByTestId("bridge-mode")).toContainText("Native WebMCP · 1 context-matched tool");
  await expect.poll(() => page.evaluate(async () =>
    (await document.modelContext!.getTools()).map((tool) => tool.name),
  )).toEqual(["cancel_order"]);

  const toolResult = await page.evaluate(async () => {
    const tool = (await document.modelContext!.getTools())[0];
    return document.modelContext!.executeTool(tool, JSON.stringify({ order_id: "#1042" }));
  });

  const parsedToolResult = typeof toolResult === "string" ? JSON.parse(toolResult) : toolResult;
  expect(parsedToolResult).toMatchObject({
    success: true,
    effectGate: {
      status: "blocked",
      verdict: "FAILED_EFFECT",
      unexpectedChanges: 1,
      regressionId: "orders__1042__status__to-cancelled",
    },
  });
  await expect(page.getByTestId("invocation-origin")).toContainText("EXTERNAL WEBMCP CALL");
  await expect(page.getByTestId("verdict-fail")).toBeVisible();
  await expect(page.getByText("TOOL CALL PASSED")).toBeVisible();
  await expect(page.getByText("REAL-WORLD EFFECT FAILED")).toBeVisible();
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE BLOCKED");
  await expect(page.getByTestId("state-gap")).toHaveText("REQUESTED 1 · CHANGED 2");
  await expect(page.getByText("UNEXPECTED", { exact: true })).toBeVisible();
});

test("a repeated external call cannot turn an already-mutated state into proof", async ({ page }) => {
  await page.goto("/?speed=0.01");
  await expect(page.getByTestId("bridge-mode")).toContainText("Native WebMCP · 1 context-matched tool");

  const results = await page.evaluate(async () => {
    const tool = (await document.modelContext!.getTools())[0];
    const input = JSON.stringify({ order_id: "#1042" });
    const first = await document.modelContext!.executeTool(tool, input);
    const second = await document.modelContext!.executeTool(tool, input);
    return [first, second].map((result) => typeof result === "string" ? JSON.parse(result) : result);
  });

  expect(results[0].effectGate).toMatchObject({
    status: "blocked",
    verdict: "FAILED_EFFECT",
    requiredMissing: 0,
    unexpectedChanges: 1,
  });
  expect(results[1].effectGate).toMatchObject({
    status: "blocked",
    verdict: "FAILED_EFFECT",
    requiredMissing: 1,
    unexpectedChanges: 0,
  });
  await expect(page.getByTestId("state-gap")).toHaveText("REQUESTED 1 · CHANGED 0");
  const recordTable = page.locator(".record-table");
  await expect(recordTable.getByText("UNEXPECTED", { exact: true })).toHaveCount(0);
  await expect(recordTable.getByText("REQUIRED", { exact: true })).toHaveCount(0);
  await expect(recordTable.getByText("UNCHANGED", { exact: true })).toHaveCount(2);
});

test("concurrent external writes fail closed instead of bypassing the gate", async ({ page }) => {
  await page.goto("/?speed=0.01");
  await expect(page.getByTestId("bridge-mode")).toContainText("Native WebMCP · 1 context-matched tool");

  const calls = await page.evaluate(async () => {
    const tool = (await document.modelContext!.getTools())[0];
    const input = JSON.stringify({ order_id: "#1042" });
    const settled = await Promise.allSettled([
      document.modelContext!.executeTool(tool, input),
      document.modelContext!.executeTool(tool, input),
    ]);
    return settled.map((entry) => entry.status === "fulfilled"
      ? { status: entry.status, value: entry.value }
      : { status: entry.status, reason: String(entry.reason) });
  });

  expect(calls.filter((entry) => entry.status === "fulfilled")).toHaveLength(1);
  expect(calls.filter((entry) => entry.status === "rejected")).toHaveLength(1);
  expect(calls.find((entry) => entry.status === "rejected")?.reason).toContain("invocation failed");
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE BLOCKED");
  await expect(page.getByTestId("state-gap")).toHaveText("REQUESTED 1 · CHANGED 2");
});

test("the judge path remains usable without horizontal overflow at 1280 by 720", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?speed=0.01");
  await expect(page.getByTestId("bridge-mode")).toContainText("Native WebMCP · 1 context-matched tool");
  await page.getByTestId("run-defect").click();
  await expect(page.getByTestId("verdict-fail")).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE BLOCKED");
  await expect(page.getByTestId("run-fixed")).toBeEnabled();
});

test("the second workflow uses the same UI and verifier", async ({ page }) => {
  await page.goto("/?speed=0.01");
  await page.getByRole("button", { name: /Permission change/ }).click();
  await expect(page.getByTestId("bridge-mode")).toContainText("Native WebMCP · 1 context-matched tool");
  await expect.poll(() => page.evaluate(async () =>
    (await document.modelContext!.getTools()).map((tool) => tool.name),
  )).toEqual(["change_user_role"]);
  const permissionSchema = await page.evaluate(async () => {
    const tool = (await document.modelContext!.getTools())[0];
    return typeof tool.inputSchema === "string"
      ? JSON.parse(tool.inputSchema)
      : tool.inputSchema;
  });
  expect(permissionSchema.properties.user_id.enum).toEqual(["Alice"]);
  expect(permissionSchema.properties.role.enum).toEqual(["Editor"]);
  await expect(page.getByRole("heading", { name: "Change only Alice to Editor" })).toBeVisible();
  await page.getByTestId("run-defect").click();
  await expect(page.getByTestId("verdict-fail")).toBeVisible();
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE BLOCKED");
  await expect(page.getByText("Bob")).toBeVisible();
  await expect(page.getByText("UNEXPECTED", { exact: true })).toBeVisible();
  await expect(page.getByTestId("regression-strip")).toContainText("permissions__alice__role__to-editor");
  await page.getByTestId("run-fixed").click();
  await expect(page.getByTestId("verdict-pass")).toBeVisible();
  await expect(page.getByTestId("gate-status")).toContainText("EFFECT GATE PASSED");
  await expect(page.getByTestId("regression-proof")).toContainText("PASS");
});
