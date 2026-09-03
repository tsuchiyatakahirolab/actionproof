import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

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

function run(command, argumentsList, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argumentsList, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code) => code === 0
      ? resolve()
      : reject(new Error(`${command} exited ${code}.`)));
  });
}

await run(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.consumer.json"],
);

await run(process.execPath, ["examples/package-consumer.mjs"]);

const temporaryRoot = await mkdtemp(path.join(tmpdir(), "exactdelta-package-audit-"));
try {
  const packDirectory = path.join(temporaryRoot, "pack");
  const consumerDirectory = path.join(temporaryRoot, "consumer");
  await mkdir(packDirectory);
  await mkdir(consumerDirectory);

  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error("npm_execpath is required for the packed-install audit.");
  await access(npmCli);
  await run(
    process.execPath,
    [npmCli, "pack", ".", "--ignore-scripts", "--pack-destination", packDirectory],
    { cwd: process.cwd() },
  );

  const packageStem = manifest.name.replace(/^@/, "").replaceAll("/", "-");
  const tarballPath = path.join(packDirectory, `${packageStem}-${manifest.version}.tgz`);
  await access(tarballPath);
  await writeFile(
    path.join(consumerDirectory, "package.json"),
    `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
    "utf8",
  );
  await copyFile(
    "examples/package-consumer.mjs",
    path.join(consumerDirectory, "consumer.mjs"),
  );
  await run(
    process.execPath,
    [npmCli, "install", tarballPath, "--ignore-scripts", "--no-package-lock", "--no-audit", "--no-fund"],
    { cwd: consumerDirectory },
  );
  await run(process.execPath, ["consumer.mjs"], { cwd: consumerDirectory });
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log(`ExactDelta package audit passed (${bundle.size} byte ESM bundle; packed install verified).`);
