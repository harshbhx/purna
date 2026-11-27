// End-to-end: real Chrome against `wrangler dev` with a fresh local D1 (docs/06-TESTING.md §4).
import { defineConfig, devices } from "@playwright/test";

const PORT = 8799;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], channel: "chrome" } },
    { name: "desktop", use: { viewport: { width: 1280, height: 900 }, channel: "chrome" } },
  ],
  webServer: {
    command: `rm -rf .tmp/e2e-state && npx wrangler d1 migrations apply purna --local --persist-to .tmp/e2e-state && npx wrangler dev --port ${PORT} --persist-to .tmp/e2e-state --show-interactive-dev-session=false`,
    url: `http://localhost:${PORT}/api/v1/health`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
  },
});
