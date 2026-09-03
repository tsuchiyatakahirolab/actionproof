import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import { loadNarration } from "./narration.mjs";

const root = process.cwd();
const narration = await loadNarration(root);
const minimumPauseMs = 600;
const targetDurationMs = 90_000;
let failed = false;

function durationMs(audioPath) {
  const probe = spawnSync(ffmpegPath, ["-i", audioPath, "-f", "null", "-"], {
    cwd: root,
    encoding: "utf8",
  });
  const match = probe.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!match) throw new Error(`Unable to read duration for ${audioPath}.`);
  return (Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])) * 1000;
}

for (let index = 0; index < narration.clips.length; index += 1) {
  const clip = narration.clips[index];
  await access(clip.audioPath);
  const duration = durationMs(clip.audioPath);
  const nextStart = narration.clips[index + 1]?.startMs ?? targetDurationMs;
  const pause = nextStart - (clip.startMs + duration);
  const status = pause >= minimumPauseMs ? "PASS" : "FAIL";
  if (status === "FAIL") failed = true;
  console.log(`${status} ${clip.id} duration=${Math.round(duration)}ms pause=${Math.round(pause)}ms ${clip.text}`);
}

if (failed) {
  throw new Error(`Narration requires at least ${minimumPauseMs}ms between every sentence and before 90 seconds.`);
}

console.log(`PASS ${narration.clips.length} sentence clips; every measured pause is at least ${minimumPauseMs}ms.`);
