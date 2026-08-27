import { expect, test } from "@playwright/test";

const defect = process.env.BASELINE_DEFECT === "1" ? "1" : "0";

test("order state is exactly the intended state", async ({ page }) => {
  await page.goto(`/baseline.html?scenario=orders&defect=${defect}`);
  await expect(page.getByTestId("baseline-bridge")).toHaveText("native-webmcp");
  await page.getByTestId("baseline-run").click();

  // BASELINE_EXPECTED_STATE_ASSERTION 1/4
  await expect(page.locator('[data-testid="record-1042"] [data-field="status"]')).toHaveText("cancelled");
  // BASELINE_EXPECTED_STATE_ASSERTION 2/4
  await expect(page.locator('[data-testid="record-1043"] [data-field="status"]')).toHaveText("active");
});

test("permission state is exactly the intended state", async ({ page }) => {
  await page.goto(`/baseline.html?scenario=permissions&defect=${defect}`);
  await expect(page.getByTestId("baseline-bridge")).toHaveText("native-webmcp");
  await page.getByTestId("baseline-run").click();

  // BASELINE_EXPECTED_STATE_ASSERTION 3/4
  await expect(page.locator('[data-testid="record-Alice"] [data-field="role"]')).toHaveText("Editor");
  // BASELINE_EXPECTED_STATE_ASSERTION 4/4
  await expect(page.locator('[data-testid="record-Bob"] [data-field="role"]')).toHaveText("Viewer");
});
