import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const submissionDirectory = path.join(root, "submission");
const origin = "http://127.0.0.1:4179";
const vite = spawn(
  process.execPath,
  [path.join(root, "node_modules", "vite", "bin", "vite.js"), "preview", "--host", "127.0.0.1", "--port", "4179", "--strictPort"],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);
let serverOutput = "";
vite.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
vite.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Submission-gallery preview did not start.\n${serverOutput}`);
}

async function callActiveTool(page, input) {
  await page.evaluate(async (argumentsRecord) => {
    const tools = await document.modelContext.getTools();
    if (tools.length !== 1) throw new Error(`Expected one active WebMCP tool; found ${tools.length}.`);
    await document.modelContext.executeTool(tools[0], JSON.stringify(argumentsRecord));
  }, input);
}

async function capture(page, filename) {
  const output = path.join(submissionDirectory, filename);
  await page.screenshot({ path: output, type: "png" });
  process.stdout.write(`${output}\n`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--enable-features=WebMCP,WebMCPTesting"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(`${origin}/?speed=0.01`);
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
  await callActiveTool(page, { order_id: "#1042" });
  await page.getByTestId("verdict-fail").waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture(page, "gallery-01-effect-trace.png");

  await page.locator(".proof-workspace").evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await capture(page, "gallery-02-failure-proof.png");

  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await capture(page, "gallery-03-identical-repair.png");

  await page.getByRole("button", { name: /Permission change/ }).click();
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
  await callActiveTool(page, { user_id: "Alice", role: "Editor" });
  await page.getByTestId("verdict-fail").waitFor();
  await page.locator(".proof-workspace").evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await capture(page, "gallery-04-same-core-permissions.png");

  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await page.locator(".benchmark-evidence").evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await capture(page, "gallery-05-measured-comparison.png");

  if (consoleErrors.length > 0) {
    throw new Error(`Submission gallery produced console errors:\n${consoleErrors.join("\n")}`);
  }
} finally {
  if (browser) await browser.close();
  vite.kill();
  vite.unref();
}
