import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceOutput = path.join(root, "submission", "youtube-thumbnail.png");
const output = path.join(root, "submission", "youtube-thumbnail-v2.png");
const publicDirectory = path.join(root, "public");
const socialOutput = path.join(publicDirectory, "og-exactdelta.png");
const vite = spawn(
  process.execPath,
  [path.join(root, "node_modules", "vite", "bin", "vite.js"), "preview", "--host", "127.0.0.1", "--port", "4178", "--strictPort"],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);
let serverOutput = "";
vite.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
vite.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4178/");
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Thumbnail preview did not start.\n${serverOutput}`);
}

let browser;

try {
  await waitForServer();
  browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--enable-features=WebMCP,WebMCPTesting"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:4178/?speed=0.01");
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
  await page.evaluate(async () => {
    const tool = (await document.modelContext.getTools())[0];
    await document.modelContext.executeTool(tool, JSON.stringify({ order_id: "#1042" }));
  });
  await page.getByTestId("verdict-fail").waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await mkdir(publicDirectory, { recursive: true });
  await page.screenshot({ path: sourceOutput, type: "png" });
  await page.screenshot({ path: output, type: "png" });
  await page.screenshot({ path: socialOutput, type: "png" });
  process.stdout.write(`${sourceOutput}\n${output}\n${socialOutput}\n`);
} finally {
  if (browser) await browser.close();
  vite.kill();
  vite.unref();
}
