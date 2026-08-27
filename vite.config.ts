import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, "index.html"),
        baseline: resolve(import.meta.dirname, "baseline.html"),
      },
    },
  },
  server: {
    headers: {
      "Permissions-Policy": "tools=*",
    },
  },
  preview: {
    headers: {
      "Permissions-Policy": "tools=*",
    },
  },
});
