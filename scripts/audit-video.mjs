import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const videoPath = path.join(root, "submission", "exactdelta-demo-90s.mp4");

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  return `${result.stdout}\n${result.stderr}`;
}

const probe = runFfmpeg(["-i", videoPath, "-f", "null", "-"]);
const durationMatch = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
if (!durationMatch) throw new Error("Unable to read the final video duration.");
const durationSeconds = Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]);
const hasH264 = /Video: h264/.test(probe);
const hasAac = /Audio: aac/.test(probe);

const volume = runFfmpeg(["-i", videoPath, "-af", "volumedetect", "-f", "null", "-"]);
const meanVolume = Number(volume.match(/mean_volume: ([-\d.]+) dB/)?.[1]);
const maxVolume = Number(volume.match(/max_volume: ([-\d.]+) dB/)?.[1]);

const silence = runFfmpeg(["-i", videoPath, "-af", "silencedetect=noise=-35dB:d=0.35", "-f", "null", "-"]);
const pauses = [...silence.matchAll(/silence_duration: ([\d.]+)/g)].map((match) => Number(match[1]));

const checks = [
  [durationSeconds >= 89.95 && durationSeconds <= 90.05, `duration=${durationSeconds.toFixed(2)}s`],
  [hasH264, "video=H.264"],
  [hasAac, "audio=AAC"],
  [Number.isFinite(meanVolume) && meanVolume >= -32 && meanVolume <= -10, `mean_volume=${meanVolume.toFixed(1)}dB`],
  [Number.isFinite(maxVolume) && maxVolume <= -0.5, `max_volume=${maxVolume.toFixed(1)}dB`],
  [pauses.length >= 20, `audible_pauses_350ms_or_longer=${pauses.length}`],
];

for (const [passed, label] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
}

if (checks.some(([passed]) => !passed)) {
  throw new Error("Final video media audit failed.");
}
