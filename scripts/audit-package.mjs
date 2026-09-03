import { access, readFile, stat } from "node:fs/promises";
import { spawn } from "node:child_process";

const required = [
  "package-dist/exactdelta.js",
  "package-dist/types/exactdelta.d.ts",
  "package-dist/types/core/gate.d.ts",
  "package-dist/types/core/regression.d.ts",
];

for (const file of required) await access(file);

const bundle = await stat("package-dist/exactdelta.js");
if (bundle.size > 30_000) {
  throw new Error(`SDK bundle exceeds 30 KB: ${bundle.size} bytes.`);
}

const manifest = JSON.parse(await readFile("package.json", "utf8"));
if (manifest.private === true) throw new Error("Package manifest is still private.");
if (manifest.dependencies && Object.keys(manifest.dependencies).length > 0) {
  throw new Error("The Effect Gate SDK must not ship runtime dependencies.");
}
if (!manifest.exports?.["."]?.import || !manifest.exports?.["."]?.types) {
  throw new Error("Package exports are incomplete.");
}

await new Promise((resolve, reject) => {
  const child = spawn(
    process.execPath,
    ["node_modules/typescript/bin/tsc", "-p", "tsconfig.consumer.json"],
    { stdio: "inherit" },
  );
  child.once("error", reject);
  child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Consumer typecheck exited ${code}.`)));
});

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ["examples/package-consumer.mjs"], {
    stdio: "inherit",
  });
  child.once("error", reject);
  child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Consumer smoke exited ${code}.`)));
});

console.log(`ExactDelta package audit passed (${bundle.size} byte ESM bundle).`);
