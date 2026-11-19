import { defineConfig, devices } from '@playwright/test';

// Must match the port the `dev` script starts Storybook on, so a Storybook
// already running there is the one the specs are run against.
const PORT = 10815;

const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  // One retry absorbs a hiccup of the machine; a test that fails twice is
  // broken, and retrying it again only delays saying so.
  retries: CI ? 1 : 0,
  // A GitHub runner has four cores, and the 3D specs paint WebGL in software
  // on several threads each: two workers keep them from starving one another.
  workers: CI ? 2 : undefined,
  // The list is what the job's log shows; the report is uploaded beside it.
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
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
    // Two specs run in WebKit too. The periodic table's proportions broke
    // there and nowhere else, because WebKit applies a host page's zoom to a
    // container-query length twice; and Safari is the share sheet that is
    // strictest about how fresh the press asking for it is. A defect no other
    // engine shows is a defect only that engine can guard.
    {
      name: 'webkit',
      testMatch: /(?:periodicZoom|figureSend)\.spec\.ts/,
      // WebKit knows no clipboard permission, and refuses to open a context
      // asking for the one the citation specs need.
      use: { ...devices['Desktop Safari'], permissions: [] },
    },
  ],
  webServer: {
    // The built book, served as files. The dev server compiles each story on
    // its first visit, which on a cold runner outlasts the waits of the specs
    // that visit it first.
    command: `npm run build-storybook -- --quiet --disable-telemetry && npx vite preview --outDir storybook-static --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 300_000,
  },
});
