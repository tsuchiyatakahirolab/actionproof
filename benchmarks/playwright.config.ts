import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "manual-playwright.spec.ts",
  timeout: 20_000,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4175",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    viewport: { width: 1280, height: 800 },
    launchOptions: {
      args: ["--enable-features=WebMCP,WebMCPTesting"],
    },
  },
});
