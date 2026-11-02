import { afterEach, expect, test, vi } from 'vitest';

import { cheminfoPlaywrightConfig } from '../config.ts';

const DEVICE = { viewport: { width: 1280, height: 720 } };

afterEach(() => {
  vi.unstubAllEnvs();
});

test('a site gets the family defaults and one dev server', () => {
  vi.stubEnv('CI', '');
  const config = cheminfoPlaywrightConfig({
    baseURL: 'http://localhost:10919',
    device: DEVICE,
  });

  expect(config).toStrictEqual({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: false,
    retries: 0,
    workers: undefined,
    reporter: 'html',
    use: { baseURL: 'http://localhost:10919', trace: 'on-first-retry' },
    projects: [{ name: 'chromium', use: DEVICE }],
    webServer: {
      command: 'npm run dev',
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
      timeout: 120_000,
      url: 'http://localhost:10919',
    },
  });
});

test('on CI the suite runs once per worker, retries and reports to GitHub', () => {
  vi.stubEnv('CI', 'true');
  const config = cheminfoPlaywrightConfig({
    baseURL: 'http://localhost:10919',
    device: DEVICE,
  });

  expect(config.forbidOnly).toBe(true);
  expect(config.retries).toBe(2);
  expect(config.workers).toBe(1);
  expect(config.reporter).toStrictEqual([
    ['github'],
    ['html', { open: 'never' }],
  ]);
  expect(config.webServer).toMatchObject({ reuseExistingServer: false });
});

test('several servers are each started, and a port replaces the url', () => {
  vi.stubEnv('CI', '');
  const config = cheminfoPlaywrightConfig({
    baseURL: 'http://localhost:10101',
    device: DEVICE,
    webServer: [
      { command: 'npm run dev -w backend', port: 10100 },
      { command: 'npm run dev -w frontend', timeout: 180_000 },
    ],
  });

  expect(config.webServer).toStrictEqual([
    {
      command: 'npm run dev -w backend',
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
      timeout: 120_000,
      port: 10100,
    },
    {
      command: 'npm run dev -w frontend',
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
      timeout: 180_000,
      url: 'http://localhost:10101',
    },
  ]);
});

test('a site lays its own settings over the defaults', () => {
  vi.stubEnv('CI', '');
  const config = cheminfoPlaywrightConfig({
    baseURL: 'http://localhost:10919',
    device: DEVICE,
    overrides: {
      fullyParallel: false,
      expect: { timeout: 15_000 },
      use: { permissions: ['clipboard-read'] },
    },
  });

  expect(config.fullyParallel).toBe(false);
  expect(config.expect).toStrictEqual({ timeout: 15_000 });
  expect(config.use).toStrictEqual({
    baseURL: 'http://localhost:10919',
    trace: 'on-first-retry',
    permissions: ['clipboard-read'],
  });
});
