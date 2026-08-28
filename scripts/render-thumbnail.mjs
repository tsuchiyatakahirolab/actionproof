import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = path.join(root, "scripts", "thumbnail-template.html");
const output = path.join(root, "submission", "youtube-thumbnail-v2.png");
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(template).href);
  await page.locator(".source").evaluate((image) => {
    if (!(image instanceof HTMLImageElement) || !image.complete || image.naturalWidth !== 1280 || image.naturalHeight !== 720) {
      throw new Error("Thumbnail source did not load at 1280x720.");
    }
  });
  await page.screenshot({ path: output, type: "png" });
  process.stdout.write(`${output}\n`);
} finally {
  await browser.close();
}
