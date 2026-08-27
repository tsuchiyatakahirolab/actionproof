import { chromium } from "@playwright/test";
import ffmpegPath from "ffmpeg-static";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const submissionDirectory = path.join(root, "submission");
const recordingDirectory = path.join(submissionDirectory, ".recording");
const audioDirectory = path.join(submissionDirectory, ".audio");
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

  await page.goto("http://127.0.0.1:4176/");
  await page.getByTestId("bridge-mode").filter({ hasText: "Native WebMCP active" }).waitFor();
  await page.waitForTimeout(7_000);

  await page.locator(".proof-workspace").scrollIntoViewIfNeeded();
  await page.waitForTimeout(10_000);

  await page.getByTestId("run-defect").click();
  await page.getByTestId("verdict-fail").waitFor();
  await page.screenshot({ path: path.join(submissionDirectory, "thumbnail.png") });
  await page.getByTestId("run-fixed").waitFor({ state: "visible" });
  await page.getByTestId("run-fixed").isEnabled();
  await page.waitForTimeout(10_000);
  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await page.getByTestId("run-defect").isEnabled();
  await page.waitForTimeout(11_000);

  await page.evaluate(() => history.replaceState({}, "", "/?speed=0.05"));
  await page.getByRole("button", { name: /Permission change/ }).click();
  await page.getByTestId("run-defect").click();
  await page.getByTestId("verdict-fail").waitFor();
  await page.getByTestId("run-fixed").waitFor({ state: "visible" });
  await page.waitForTimeout(2_000);
  await page.getByTestId("run-fixed").click();
  await page.getByTestId("verdict-pass").waitFor();
  await page.waitForTimeout(2_000);

  await page.locator(".benchmark-evidence").scrollIntoViewIfNeeded();
  await page.waitForTimeout(12_000);
  await page.locator(".hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(4_000);

  await context.close();
  const rawVideo = await video.path();
  browser.process()?.kill();
  browser = undefined;

  const audioFiles = (await readdir(audioDirectory))
    .filter((name) => name.endsWith(".wav"))
    .sort()
    .map((name) => path.join(audioDirectory, name));
  if (audioFiles.length !== 10) throw new Error(`Expected 10 narration segments, found ${audioFiles.length}.`);

  const startsMs = [0, 7_000, 17_000, 27_000, 34_000, 47_000, 57_000, 68_000, 77_000, 87_000];
  const inputs = ["-i", rawVideo];
  for (const audioFile of audioFiles) inputs.push("-i", audioFile);
  const delayed = startsMs.map((start, index) => `[${index + 1}:a]adelay=${start}|${start}[a${index + 1}]`).join(";");
  const mixInputs = startsMs.map((_start, index) => `[a${index + 1}]`).join("");
  const filter = `${delayed};${mixInputs}amix=inputs=10:duration=longest:normalize=0,apad[aout]`;
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
  browser?.process()?.kill();
  vite.kill();
}
