import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadNarration(root) {
  const timelinePath = path.join(root, "scripts", "narration-timeline.json");
  const timeline = JSON.parse(await readFile(timelinePath, "utf8"));
  const audioDirectory = path.join(root, "submission", ".audio");
  const clips = timeline.clips.map((clip) => ({
    ...clip,
    audioPath: path.join(audioDirectory, `${clip.id}.mp3`),
  }));

  return { ...timeline, clips };
}

export function buildNarrationMix(clips) {
  const delayed = clips
    .map((clip, index) => `[${index + 1}:a]adelay=${clip.startMs}|${clip.startMs}[a${index + 1}]`)
    .join(";");
  const mixInputs = clips.map((_clip, index) => `[a${index + 1}]`).join("");
  return `${delayed};${mixInputs}amix=inputs=${clips.length}:duration=longest:normalize=0,apad[aout]`;
}
