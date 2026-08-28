import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.RUNTIME_AUDIT_URL ?? "http://127.0.0.1:4173";
const outputPath = process.env.RUNTIME_AUDIT_OUTPUT
  ? path.resolve(process.env.RUNTIME_AUDIT_OUTPUT)
  : path.join(process.cwd(), "submission", "private", "RUNTIME_QUALITY_AUDIT.json");
const cpuSlowdown = Number(process.env.RUNTIME_CPU_SLOWDOWN ?? "1");
const runCount = Number(process.env.RUNTIME_AUDIT_RUNS ?? "3");
if (!Number.isFinite(cpuSlowdown) || cpuSlowdown < 1) throw new Error("RUNTIME_CPU_SLOWDOWN must be at least 1.");
if (!Number.isInteger(runCount) || runCount < 1) throw new Error("RUNTIME_AUDIT_RUNS must be a positive integer.");
const thresholds = {
  ttfbMs: 800,
  fcpMs: 1_800,
  lcpMs: 2_500,
  tbtMs: 200,
  cls: 0.1,
};
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-features=WebMCP,WebMCPTesting"],
});

async function auditColdRun(run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  try {
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 40,
      downloadThroughput: 10 * 1024 * 1024 / 8,
      uploadThroughput: 5 * 1024 * 1024 / 8,
      connectionType: "wifi",
    });
    await client.send("Emulation.setCPUThrottlingRate", { rate: cpuSlowdown });
    await page.addInitScript(() => {
      window.__exactDeltaQuality = { cls: 0, lcpMs: 0, tbtMs: 0 };
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) window.__exactDeltaQuality.lcpMs = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__exactDeltaQuality.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__exactDeltaQuality.tbtMs += Math.max(0, entry.duration - 50);
        }
      }).observe({ type: "longtask", buffered: true });
    });

    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response?.ok()) throw new Error(`Runtime page returned ${response?.status()}.`);
    await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const fcp = performance.getEntriesByName("first-contentful-paint")[0];
      const resources = performance.getEntriesByType("resource");
      const origin = location.origin;
      return {
        ttfbMs: navigation.responseStart,
        fcpMs: fcp?.startTime ?? null,
        lcpMs: window.__exactDeltaQuality.lcpMs,
        tbtMs: window.__exactDeltaQuality.tbtMs,
        cls: window.__exactDeltaQuality.cls,
        domContentLoadedMs: navigation.domContentLoadedEventEnd,
        loadMs: navigation.loadEventEnd,
        resourceRequests: resources.length,
        crossOriginRuntimeRequests: resources
          .map((entry) => entry.name)
          .filter((name) => new URL(name).origin !== origin),
      };
    });
    const accessibility = run === 1
      ? await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
      : null;
    return {
      run,
      metrics,
      accessibilityViolations: accessibility?.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.flatMap((node) => node.target),
      })) ?? [],
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

try {
  const runs = [];
  for (let run = 1; run <= runCount; run += 1) runs.push(await auditColdRun(run));
  const worst = {
    ttfbMs: Math.max(...runs.map(({ metrics }) => metrics.ttfbMs)),
    fcpMs: Math.max(...runs.map(({ metrics }) => metrics.fcpMs ?? Number.POSITIVE_INFINITY)),
    lcpMs: Math.max(...runs.map(({ metrics }) => metrics.lcpMs)),
    tbtMs: Math.max(...runs.map(({ metrics }) => metrics.tbtMs)),
    cls: Math.max(...runs.map(({ metrics }) => metrics.cls)),
  };
  const crossOriginRuntimeRequests = [...new Set(runs.flatMap(({ metrics }) => metrics.crossOriginRuntimeRequests))];
  const accessibilityViolations = runs.flatMap(({ accessibilityViolations }) => accessibilityViolations);
  const consoleErrors = runs.flatMap(({ consoleErrors }) => consoleErrors);
  const checks = {
    ttfbGood: worst.ttfbMs < thresholds.ttfbMs,
    fcpGood: worst.fcpMs < thresholds.fcpMs,
    lcpGood: worst.lcpMs > 0 && worst.lcpMs < thresholds.lcpMs,
    tbtGood: worst.tbtMs < thresholds.tbtMs,
    clsGood: worst.cls < thresholds.cls,
    noCrossOriginRuntimeRequests: crossOriginRuntimeRequests.length === 0,
    noAutomatedWcagAOrAaViolations: accessibilityViolations.length === 0,
    noConsoleErrors: consoleErrors.length === 0,
  };
  const output = {
    auditedAt: new Date().toISOString(),
    url,
    method: `${runCount} cold Chrome desktop lab runs; 40 ms latency, 10 Mbps down, 5 Mbps up, ${cpuSlowdown}x CPU; gates use the worst run; not field data or a Lighthouse score`,
    thresholds,
    runs,
    worst,
    crossOriginRuntimeRequests,
    accessibilityViolations,
    consoleErrors,
    checks,
    pass: Object.values(checks).every(Boolean),
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output, null, 2));
  if (!output.pass) process.exitCode = 1;
} finally {
  await browser.close();
}
