import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/auth",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3101",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
    trace: "retain-on-failure",
  },
  webServer: [
    { command: "node tests/auth/mock-supabase.mjs", url: "http://127.0.0.1:54329/health", reuseExistingServer: false },
    {
      command: "node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3101",
      url: "http://127.0.0.1:3101/login",
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        AUTH_TEST_MODE: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_fixture",
        APP_URL: "http://127.0.0.1:3101",
      },
    },
  ],
});
