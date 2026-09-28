import { defineConfig, devices } from "@playwright/test"

const PORT = 3100

/**
 * Visual regression tests. Baselines are Linux screenshots made in CI; run
 * `pnpm test:visual` locally to compare against your own platform's baselines.
 */
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: {
    // A small absolute budget: a ratio lets small changes (a badge corner) hide inside a large preview.
    toHaveScreenshot: { maxDiffPixels: 20, animations: "disabled", caret: "hide" },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  },
  projects: [
    { name: "light", use: { ...devices["Desktop Chrome"], colorScheme: "light" } },
    { name: "dark", use: { ...devices["Desktop Chrome"], colorScheme: "dark" } },
  ],
  webServer: {
    // Separate build folder: running tests never interferes with `pnpm dev`.
    command: `NEXT_DIST_DIR=.next-test pnpm build && NEXT_DIST_DIR=.next-test pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
