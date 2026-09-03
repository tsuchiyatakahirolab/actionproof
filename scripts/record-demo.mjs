import { chromium } from "@playwright/test";
import ffmpegPath from "ffmpeg-static";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { buildNarrationMix, loadNarration } from "./narration.mjs";

const root = process.cwd();
const submissionDirectory = path.join(root, "submission");
const recordingDirectory = path.join(submissionDirectory, ".recording");
await rm(recordingDirectory, { recursive: true, force: true });
await mkdir(recordingDirectory, { recursive: true });

const vite = spawn(
  process.execPath,
  [path.join(root, "node_modules", "vite", "bin", "vite.js"), "preview", "--host", "127.0.0.1", "--port", "4176", "--strictPort"],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);
let serverOutput = "";
vite.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
vite.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4176/");
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Preview did not start.\n${serverOutput}`);
}

async function closeBrowserBounded(instance) {
  await Promise.race([
    instance.close(),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
}

async function settleBounded(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(undefined), milliseconds)),
  ]);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--enable-features=WebMCP,WebMCPTesting"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: recordingDirectory, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const video = page.video();

  await page.goto("http://127.0.0.1:4176/?timing=demo");
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
  const timelineStartedAt = Date.now();
  const waitUntil = async (milliseconds) => {
    const remaining = timelineStartedAt + milliseconds - Date.now();
    if (remaining > 0) await page.waitForTimeout(remaining);
  };

  await waitUntil(7_000);

  await page.locator(".proof-workspace").evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await waitUntil(12_500);
  await page.evaluate(async () => {
    const tool = (await document.modelContext.getTools())[0];
    await document.modelContext.executeTool(tool, JSON.stringify({ order_id: "#1042" }));
  });
  await page.getByTestId("verdict-fail").waitFor({ timeout: 50_000 });
  await page.screenshot({ path: path.join(submissionDirectory, "thumbnail.png") });
  await waitUntil(56_000);

  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await waitUntil(66_500);

  await page.getByRole("button", { name: /Permission change/ }).click();
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
  await page.locator(".proof-workspace").evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.evaluate(async () => {
    const tool = (await document.modelContext.getTools())[0];
    await document.modelContext.executeTool(tool, JSON.stringify({ user_id: "Alice", role: "Editor" }));
  });
  await page.getByTestId("verdict-fail").waitFor();
  await waitUntil(72_000);
  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await waitUntil(77_000);

  await page.locator(".benchmark-evidence").scrollIntoViewIfNeeded();
  await waitUntil(91_000);

  await settleBounded(context.close().catch(() => undefined), 5_000);
  const pathFromPlaywright = await settleBounded(video.path().catch(() => undefined), 5_000);
  const fallbackRecording = (await readdir(recordingDirectory))
    .filter((name) => name.endsWith(".webm"))
    .sort()
    .at(-1);
  const rawVideo = pathFromPlaywright ?? (fallbackRecording && path.join(recordingDirectory, fallbackRecording));
  if (!rawVideo) throw new Error("Browser recording did not produce a WebM file.");
  await closeBrowserBounded(browser);
  browser = undefined;

  const narration = await loadNarration(root);
  await Promise.all(narration.clips.map((clip) => access(clip.audioPath)));
  const inputs = ["-i", rawVideo];
  for (const clip of narration.clips) inputs.push("-i", clip.audioPath);
  const filter = buildNarrationMix(narration.clips);
  const outputPath = path.join(submissionDirectory, "exactdelta-demo-90s.mp4");
  const ffmpeg = spawnSync(
    ffmpegPath,
    [
      "-y",
      ...inputs,
      "-filter_complex", filter,
      "-map", "0:v:0",
      "-map", "[aout]",
      "-t", "90",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "22",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "160k",
      "-movflags", "+faststart",
      outputPath,
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  if (ffmpeg.status !== 0) {
    throw new Error(`ffmpeg failed.\n${ffmpeg.stdout}\n${ffmpeg.stderr}`);
  }
  console.log(`Created ${outputPath}`);
} finally {
  if (browser) await closeBrowserBounded(browser);
  vite.kill();
  vite.unref();
}

// Playwright can retain an already-closed Windows transport handle after video capture.
// Reaching this line means recording, muxing, and all explicit checks completed successfully.
process.exit(0);
