import { defineConfig, devices } from '@playwright/test';

// This suite never targets Sites or the shared hosted Supabase project.
function requireLoopback(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required for disposable local Auth verification.`);
  const url = new URL(value);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.protocol !== 'http:' || url.username || url.password) {
    throw new Error(`${name} must point to an HTTP loopback service. Hosted targets are refused.`);
  }
  return url.origin;
}

const supabaseURL = requireLoopback('SUPABASE_TEST_URL', process.env.SUPABASE_TEST_URL);
requireLoopback('SUPABASE_TEST_MAIL_URL', process.env.SUPABASE_TEST_MAIL_URL);
if (!process.env.SUPABASE_TEST_ANON_KEY || !process.env.SUPABASE_TEST_SERVICE_ROLE_KEY) {
  throw new Error('The local test runner requires its disposable public and cleanup credentials.');
}
if (process.env.PLAYWRIGHT_BASE_URL) {
  throw new Error('This Auth suite starts its own local Astro server; PLAYWRIGHT_BASE_URL is not supported.');
}

export default defineConfig({
  testDir: './tests/auth',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  // Auth redirects, passwords and bearer tokens must not become CI artifacts.
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'off', screenshot: 'off', video: 'off' },
  projects: [{ name: 'chromium-auth', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000/conta',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ASTRO_TELEMETRY_DISABLED: '1',
      PUBLIC_SUPABASE_URL: supabaseURL,
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_TEST_ANON_KEY,
      PUBLIC_SUPABASE_ANON_KEY: '',
      // Cleanup credentials stay in the Node test runner, outside Astro's process.
      SUPABASE_TEST_SERVICE_ROLE_KEY: '',
      AI_ENABLED: 'false',
      AI_PROVIDER: 'simulated',
      OPENAI_API_KEY: '',
    },
  },
});
