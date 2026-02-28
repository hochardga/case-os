import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      PHASE1_E2E_AUTH_BYPASS: "1",
      ANALYTICS_PROVIDER: "memory",
      ANALYTICS_TEST_MODE: "1",
      AUTH_RATE_LIMIT_STORE: "memory",
      AUTH_RATE_LIMIT_LOGIN_MAX_ATTEMPTS: "1",
      AUTH_RATE_LIMIT_LOGIN_WINDOW_SECONDS: "60",
      AUTH_RATE_LIMIT_LOGIN_BLOCK_SECONDS: "120"
    }
  }
});
