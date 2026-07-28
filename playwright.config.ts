import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Vitest owns `.test.ts` (including the dist/ SEO corpus suite).
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },

  webServer: {
    // `serve` is a pinned devDependency — do not use `npx`, which resolves an
    // unpinned version over the network on every CI run.
    command: "pnpm exec serve dist -l 4321",
    url: "http://localhost:4321",
    reuseExistingServer: false,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
