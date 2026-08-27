import { expect, test } from "@playwright/test";

test("the seeded defect is silently legible and the repaired run passes", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/?speed=0.01");
  await expect(page.getByTestId("bridge-mode")).toContainText("Native WebMCP active");
  await expect(page.getByRole("heading", { name: "The agent did everything right. The result was still wrong." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cancel only Order #1042" })).toBeVisible();
  await expect(page.getByTestId("effect-contract")).toContainText("#1042.status → cancelled");
  await expect(page.getByText("Correct WebMCP call")).toBeVisible();

  await page.getByTestId("run-defect").click();
  await expect(page.getByTestId("verdict-fail")).toBeVisible();
  await expect(page.getByText("TOOL CALL PASSED")).toBeVisible();
  await expect(page.getByText("REAL-WORLD EFFECT FAILED")).toBeVisible();
  await expect(page.getByTestId("state-gap")).toHaveText("REQUESTED 1 · CHANGED 2");
  await expect(page.getByText("UNEXPECTED", { exact: true })).toBeVisible();
  await expect(page.getByTestId("regression-strip")).toContainText("orders__#1042__status");

  await expect(page.getByTestId("run-fixed")).toBeEnabled();
  await page.getByTestId("run-fixed").click();
  await expect(page.getByTestId("verdict-pass")).toBeVisible();
  await expect(page.getByText("ACTION PROVEN")).toBeVisible();
  await expect(page.getByTestId("regression-proof")).toContainText("IDENTICAL REGRESSION");
  await expect(page.getByTestId("regression-proof")).toContainText("PASS");

  expect(consoleErrors).toEqual([]);
});

test("the second workflow uses the same UI and verifier", async ({ page }) => {
  await page.goto("/?speed=0.01");
  await page.getByRole("button", { name: /Permission change/ }).click();
  await expect(page.getByRole("heading", { name: "Change only Alice to Editor" })).toBeVisible();
  await page.getByTestId("run-defect").click();
  await expect(page.getByTestId("verdict-fail")).toBeVisible();
  await expect(page.getByText("Bob")).toBeVisible();
  await expect(page.getByText("UNEXPECTED", { exact: true })).toBeVisible();
  await expect(page.getByTestId("regression-strip")).toContainText("permissions__Alice__role");
  await page.getByTestId("run-fixed").click();
  await expect(page.getByTestId("verdict-pass")).toBeVisible();
  await expect(page.getByTestId("regression-proof")).toContainText("PASS");
});
