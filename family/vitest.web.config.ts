// Unit and component tests for the web app, in jsdom.
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(__dirname, "web/src") } },
  // The browser table imports Purna's sounds from Assets/Audio, outside the web root.
  server: { fs: { allow: [resolve(__dirname, "..")] } },
  test: {
    include: ["web-test/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "https://purna.dualmindlab.tech/" } },
    setupFiles: ["./web-test/setup.ts"],
  },
});
