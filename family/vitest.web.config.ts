// Unit tests for the browser code in public/assets, in jsdom (no Worker runtime needed).
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["web-test/**/*.test.ts"],
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "https://purna.dualmindlab.tech/" } },
  },
});
