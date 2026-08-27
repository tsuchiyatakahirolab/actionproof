import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const submissionDirectory = path.join(root, "submission");
const recordingDirectory = path.join(submissionDirectory, ".recording");
const audioDirectory = path.join(submissionDirectory, ".audio");
const rawVideo = process.argv[2] ?? path.join(
  recordingDirectory,
  (await readdir(recordingDirectory)).filter((name) => name.endsWith(".webm")).sort().at(-1),
);
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
