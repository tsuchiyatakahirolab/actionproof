import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { buildNarrationMix, loadNarration } from "./narration.mjs";

const root = process.cwd();
const submissionDirectory = path.join(root, "submission");
const recordingDirectory = path.join(submissionDirectory, ".recording");
const rawVideo = process.argv[2] ?? path.join(
  recordingDirectory,
  (await readdir(recordingDirectory)).filter((name) => name.endsWith(".webm")).sort().at(-1),
);
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
