/**
 * The Playwright configuration every site of the family runs its browser suite
 * with, so retries, reporters, traces and the dev server are one decision.
 */

import { availableParallelism } from 'node:os';

import type {
  PlaywrightTestConfig,
  PlaywrightTestOptions,
} from '@playwright/test';

/**
 * The most browsers a suite opens at once when nothing says otherwise. Every
 * one of them loads its pages from the one server the suite starts, so past
 * this the server is the bottleneck and specs run out of time rather than
 * finish sooner — on a 128-thread machine, Playwright's own default of half
 * the cores is 64.
 */
export const MAX_DEFAULT_WORKERS = 16;

/**
 * The environment variable that says how many browsers a suite opens at once:
 * a count (`8`) or a share of the cores (`25%`). It wins over the default and
 * over a site's own `overrides.workers`, because it is what the person running
 * the suite asked for on that machine.
 */
export const WORKERS_ENV = 'PLAYWRIGHT_WORKERS';

/** One server the suite starts, as Playwright's `webServer` describes it. */
type WebServer = Exclude<
  NonNullable<PlaywrightTestConfig['webServer']>,
  unknown[]
>;

/** What {@link cheminfoPlaywrightConfig} needs from a site. */
export interface CheminfoPlaywrightOptions {
  /** The address the pages are opened on: the server the suite starts. */
  baseURL: string;
  /**
   * The browser the suite runs in, as `@playwright/test` describes it —
   * `devices['Desktop Chrome']`. Passed in, so this entry never loads
   * Playwright itself.
   */
  device: Partial<PlaywrightTestOptions>;
  /**
   * How the site is served while the suite runs: one server, answering on
   * `baseURL` unless it says otherwise, or several (a backend and a frontend).
   * @default { command: 'npm run dev' }
   */
  webServer?: Partial<WebServer> | Array<Partial<WebServer>>;
  /**
   * Whatever else the site's suite needs, laid over the family's defaults.
   * @default {}
   */
  overrides?: PlaywrightTestConfig;
}

/**
 * The family's Playwright configuration for one site: specs in `e2e/`, run in
 * parallel; on CI one worker, two retries, a trace on the first retry and the
 * GitHub reporter beside the HTML one; locally a server already running is
 * reused, and half the cores run the suite, never more than
 * {@link MAX_DEFAULT_WORKERS}. {@link WORKERS_ENV} sets the count instead.
 *
 * ```ts
 * import { defineConfig, devices } from '@playwright/test';
 * import { cheminfoPlaywrightConfig } from 'react-cheminfo/playwright';
 *
 * export default defineConfig(
 *   cheminfoPlaywrightConfig({
 *     baseURL: 'http://localhost:10919',
 *     device: devices['Desktop Chrome'],
 *   }),
 * );
 * ```
 * @param options - See {@link CheminfoPlaywrightOptions}.
 * @returns The configuration, for `defineConfig`.
 */
export function cheminfoPlaywrightConfig(
  options: CheminfoPlaywrightOptions,
): PlaywrightTestConfig {
  const { baseURL, device, webServer = {}, overrides = {} } = options;
  const onCi = Boolean(process.env.CI);
  const servers = Array.isArray(webServer) ? webServer : [webServer];
  const served = servers.map((server) => serverOf(server, baseURL, onCi));
  const requested = readWorkers(process.env[WORKERS_ENV]);
  return {
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: onCi,
    retries: onCi ? 2 : 0,
    workers: onCi ? 1 : defaultWorkers(),
    reporter: onCi ? [['github'], ['html', { open: 'never' }]] : 'html',
    ...overrides,
    ...(requested === undefined ? {} : { workers: requested }),
    use: { baseURL, trace: 'on-first-retry', ...overrides.use },
    projects: overrides.projects ?? [{ name: 'chromium', use: { ...device } }],
    webServer: served.length === 1 ? served[0] : served,
  };
}

function defaultWorkers(): number {
  const half = Math.floor(availableParallelism() / 2);
  return Math.max(1, Math.min(MAX_DEFAULT_WORKERS, half));
}

/**
 * A worker count as {@link WORKERS_ENV} writes it, or `undefined` for one
 * nobody set or nobody can read, which leaves the default in place.
 * @param value - The variable's value.
 * @returns A positive count, a positive share of the cores, or `undefined`.
 */
function readWorkers(value: string | undefined): number | string | undefined {
  const text = value?.trim() ?? '';
  const count = Number.parseInt(text, 10);
  if (!/^\d+%?$/.test(text) || count < 1) return undefined;
  return text.endsWith('%') ? text : count;
}

function serverOf(
  server: Partial<WebServer>,
  baseURL: string,
  onCi: boolean,
): WebServer {
  return {
    command: 'npm run dev',
    reuseExistingServer: !onCi,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120_000,
    ...(server.port === undefined ? { url: baseURL } : {}),
    ...server,
  };
}
