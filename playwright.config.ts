import { defineConfig, devices } from '@playwright/test';

// Must match the port the `dev` script starts Storybook on.
const DEV_PORT = 10815;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${DEV_PORT}`,
    trace: 'on-first-retry',
    // The citation entries write to the clipboard, which is the behaviour under
    // test — without this the copy rejects and only the failure path is covered.
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // `--ci` keeps Storybook from opening a browser and from phoning home.
    command: 'npm run dev -- --ci',
    url: `http://localhost:${DEV_PORT}`,
    reuseExistingServer: !process.env.CI,
    // Storybook builds its index before it answers, which a plain Vite server
    // does not, so the stock minute is not enough on a cold CI runner.
    timeout: 180_000,
  },
});
