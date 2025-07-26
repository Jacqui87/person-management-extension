/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "https://localhost:7048",
    },
  },
  build: {
    outDir: "../wwwroot", // emit static assets to wwwroot for ASP.NET Core
    emptyOutDir: true, // clean wwwroot before building
    assetsDir: "assets", // put assets in wwwroot/assets
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    exclude: ["node_modules"],
  },
});
