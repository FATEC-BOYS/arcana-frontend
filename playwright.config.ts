import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:4200", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/serve-preview.mjs",
    url: "http://127.0.0.1:4200",
    reuseExistingServer: !process.env["CI"],
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
