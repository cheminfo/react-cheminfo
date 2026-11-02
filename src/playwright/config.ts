/**
 * The Playwright configuration every site of the family runs its browser suite
 * with, so retries, reporters, traces and the dev server are one decision.
 */

import type {
  PlaywrightTestConfig,
  PlaywrightTestOptions,
} from '@playwright/test';

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
 * reused.
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
  return {
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: onCi,
    retries: onCi ? 2 : 0,
    workers: onCi ? 1 : undefined,
    reporter: onCi ? [['github'], ['html', { open: 'never' }]] : 'html',
    ...overrides,
    use: { baseURL, trace: 'on-first-retry', ...overrides.use },
    projects: overrides.projects ?? [{ name: 'chromium', use: { ...device } }],
    webServer: served.length === 1 ? served[0] : served,
  };
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
