import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
    video: { mode: "on", size: { width: 1280, height: 720 } },
    trace: "on",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
