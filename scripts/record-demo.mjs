import { chromium } from "@playwright/test";
import ffmpegPath from "ffmpeg-static";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdir, rm } from "node:fs/promises";
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

  await page.locator(".proof-workspace").scrollIntoViewIfNeeded();
  await page.getByTestId("run-defect").click();
  await page.getByTestId("verdict-fail").waitFor({ timeout: 50_000 });
  await page.screenshot({ path: path.join(submissionDirectory, "thumbnail.png") });
  await waitUntil(57_000);

  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await waitUntil(68_000);

  await page.getByRole("button", { name: /Permission change/ }).click();
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP · 1 context-matched tool" }).waitFor();
  await page.getByTestId("run-defect").click();
  await page.getByTestId("verdict-fail").waitFor();
  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await waitUntil(77_000);

  await page.locator(".benchmark-evidence").scrollIntoViewIfNeeded();
  await waitUntil(87_000);
  await page.locator(".hero").scrollIntoViewIfNeeded();
  await waitUntil(91_000);

  await context.close();
  const rawVideo = await video.path();
  void browser.close();
  browser = undefined;

  const narration = await loadNarration(root);
  await Promise.all(narration.clips.map((clip) => access(clip.audioPath)));
  const inputs = ["-i", rawVideo];
  for (const clip of narration.clips) inputs.push("-i", clip.audioPath);
  const filter = buildNarrationMix(narration.clips);
  const outputPath = path.join(submissionDirectory, "actionproof-demo-90s.mp4");
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
  if (browser) void browser.close();
  vite.kill();
}
