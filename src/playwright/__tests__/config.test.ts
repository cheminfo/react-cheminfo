import type * as os from 'node:os';

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { cheminfoPlaywrightConfig } from '../config.ts';

const DEVICE = { viewport: { width: 1280, height: 720 } };

const machine = vi.hoisted(() => ({ cores: 8 }));

vi.mock('node:os', async (importOriginal) => ({
  ...(await importOriginal<typeof os>()),
  availableParallelism: () => machine.cores,
}));

beforeEach(() => {
  vi.stubEnv('PLAYWRIGHT_WORKERS', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  machine.cores = 8;
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
    workers: 4,
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

test('a big machine opens no more browsers than one server can feed', () => {
  vi.stubEnv('CI', '');
  const options = { baseURL: 'http://localhost:10919', device: DEVICE };

  machine.cores = 128;

  expect(cheminfoPlaywrightConfig(options).workers).toBe(16);

  machine.cores = 20;

  expect(cheminfoPlaywrightConfig(options).workers).toBe(10);

  machine.cores = 1;

  expect(cheminfoPlaywrightConfig(options).workers).toBe(1);
});

test('PLAYWRIGHT_WORKERS sets the count, over the site and over CI', () => {
  const options = {
    baseURL: 'http://localhost:10919',
    device: DEVICE,
    overrides: { workers: 2 },
  };

  vi.stubEnv('CI', '');
  vi.stubEnv('PLAYWRIGHT_WORKERS', '24');

  expect(cheminfoPlaywrightConfig(options).workers).toBe(24);

  vi.stubEnv('PLAYWRIGHT_WORKERS', ' 25% ');

  expect(cheminfoPlaywrightConfig(options).workers).toBe('25%');

  vi.stubEnv('CI', 'true');
  vi.stubEnv('PLAYWRIGHT_WORKERS', '3');

  expect(cheminfoPlaywrightConfig(options).workers).toBe(3);
});

test('a PLAYWRIGHT_WORKERS nobody can read leaves the default', () => {
  vi.stubEnv('CI', '');
  const options = { baseURL: 'http://localhost:10919', device: DEVICE };

  for (const value of ['many', '0', '0%', '-2', '1.5', '']) {
    vi.stubEnv('PLAYWRIGHT_WORKERS', value);

    expect(cheminfoPlaywrightConfig(options).workers).toBe(4);
  }
  vi.stubEnv('PLAYWRIGHT_WORKERS', 'many');

  expect(
    cheminfoPlaywrightConfig({ ...options, overrides: { workers: 2 } }).workers,
  ).toBe(2);
});
