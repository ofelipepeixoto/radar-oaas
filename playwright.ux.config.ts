import { defineConfig, devices } from '@playwright/test';

if (process.env.PLAYWRIGHT_BASE_URL) throw new Error('UX fixture tests start their own loopback server; remote targets are refused.');
process.env.PLAYWRIGHT_NO_COPY_PROMPT = '1';

export default defineConfig({
  testDir: './tests/ux',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'off', screenshot: 'off', video: 'off' },
  projects: [{ name: 'chromium-ux', use: { ...devices['Desktop Chrome'], launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote', '--in-process-gpu', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : undefined } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/conta',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { ASTRO_TELEMETRY_DISABLED: '1', PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic_ui_fixture', PUBLIC_SUPABASE_ANON_KEY: '', AI_ENABLED: 'false', AI_PROVIDER: 'simulated', OPENAI_API_KEY: '' },
  },
});
