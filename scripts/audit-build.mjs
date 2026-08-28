import { gzipSync } from "node:zlib";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const assetDirectory = path.join(dist, "assets");
const outputPath = process.env.BUILD_AUDIT_OUTPUT
  ? path.resolve(process.env.BUILD_AUDIT_OUTPUT)
  : path.join(root, "submission", "private", "BUILD_QUALITY_AUDIT.json");
const budgets = {
  javascriptGzipBytes: 75 * 1024,
  cssGzipBytes: 6 * 1024,
  htmlGzipBytes: 2 * 1024,
};

const assetNames = await readdir(assetDirectory);
const assetRecords = await Promise.all(assetNames.map(async (name) => {
  const bytes = await readFile(path.join(assetDirectory, name));
  return {
    name,
    rawBytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
  };
}));
const html = await readFile(path.join(dist, "index.html"));
const htmlText = html.toString("utf8");
const socialCard = await readFile(path.join(dist, "og-exactdelta.png"));
const pngSignature = "89504e470d0a1a0a";
const png = {
  signatureValid: socialCard.subarray(0, 8).toString("hex") === pngSignature,
  width: socialCard.readUInt32BE(16),
  height: socialCard.readUInt32BE(20),
  bytes: socialCard.length,
};
const totals = assetRecords.reduce((result, asset) => {
  const bucket = asset.name.endsWith(".js") ? "javascript" : asset.name.endsWith(".css") ? "css" : "other";
  result[bucket].rawBytes += asset.rawBytes;
  result[bucket].gzipBytes += asset.gzipBytes;
  return result;
}, {
  javascript: { rawBytes: 0, gzipBytes: 0 },
  css: { rawBytes: 0, gzipBytes: 0 },
  other: { rawBytes: 0, gzipBytes: 0 },
});
const htmlGzipBytes = gzipSync(html).length;
const externallyLoadedAssets = [...htmlText.matchAll(/<(?:script|link)[^>]+(?:src|href)=["'](https?:\/\/[^"']+)/gi)]
  .map((match) => match[1]);
const sourceMaps = assetNames.filter((name) => name.endsWith(".map"));
const metadata = {
  description: /<meta\s+name=["']description["']/i.test(htmlText),
  openGraphTitle: /<meta\s+property=["']og:title["']/i.test(htmlText),
  openGraphDescription: /<meta\s+property=["']og:description["']/i.test(htmlText),
  openGraphImage: /<meta\s+property=["']og:image["']/i.test(htmlText),
  twitterLargeImage: /<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']/i.test(htmlText),
};
const checks = {
  javascriptWithinBudget: totals.javascript.gzipBytes <= budgets.javascriptGzipBytes,
  cssWithinBudget: totals.css.gzipBytes <= budgets.cssGzipBytes,
  htmlWithinBudget: htmlGzipBytes <= budgets.htmlGzipBytes,
  noExternalRuntimeAssets: externallyLoadedAssets.length === 0,
  noProductionSourceMaps: sourceMaps.length === 0,
  completeSocialMetadata: Object.values(metadata).every(Boolean),
  socialCardIs1280By720Png: png.signatureValid && png.width === 1280 && png.height === 720,
};
const output = {
  auditedAt: new Date().toISOString(),
  scope: "deterministic production-build budget; gzip values include every emitted JS/CSS asset",
  budgets,
  totals: { ...totals, html: { rawBytes: html.length, gzipBytes: htmlGzipBytes } },
  assets: assetRecords,
  externallyLoadedAssets,
  sourceMaps,
  metadata,
  socialCard: png,
  checks,
  pass: Object.values(checks).every(Boolean),
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (!output.pass) process.exitCode = 1;
