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
  expect(downloadedArtifact.schemaVersion).toBe("actionproof.regression.v1");
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
