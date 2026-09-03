import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/exactdelta.ts"),
      formats: ["es"],
      fileName: () => "exactdelta.js",
    },
    outDir: "package-dist",
    emptyOutDir: true,
    minify: "esbuild",
  },
});
