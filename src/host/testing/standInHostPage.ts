/**
 * The test's side of the stand-in host: what the framed site sent it, the
 * answer to one request, a request sent once the site has connected, and the
 * address the framed site is at. Each runs in the test, on the host's page.
 */

import type { Frame, Page } from '@playwright/test';

import { pollUntil } from '../../playwright/poll.ts';

import { readStandInHostLog, sendStandInHostRequest } from './standInHost.ts';

/** How long a helper of the stand-in host waits. */
export interface StandInHostWaitOptions {
  /**
   * How long to wait, in milliseconds.
   * @default 5000 - what `expect.poll` waits by default
   */
  timeout?: number;
}

/** What a site answers to a `get` of its `figure` output. */
export interface StandInHostFigureAnswer {
  type?: string;
  id?: string;
  ok?: boolean;
  items?: Array<{ key?: string; kind?: string; value: { svg: string } }>;
}

/**
 * Every message the framed site sent the stand-in host, in order: results and
 * outputs.
 * @param page - The host's page.
 * @returns The messages.
 */
export async function standInHostResults(page: Page): Promise<unknown[]> {
  const { results } = await page.evaluate(readStandInHostLog);
  return results;
}

/**
 * The site's answer to one request, once it has come.
 * @param page - The host's page.
 * @param id - The request's id.
 * @param options - See {@link StandInHostWaitOptions}.
 * @returns The first message carrying that id.
 */
export async function standInHostAnswer<T = unknown>(
  page: Page,
  id: string,
  options: StandInHostWaitOptions = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT } = options;
  return pollUntil(
    async () => {
      const results = await standInHostResults(page);
      return results.find(
        (message) => (message as { id?: unknown } | null)?.id === id,
      ) as T | undefined;
    },
    timeout,
    `no answer to the request ${id}`,
  );
}

/**
 * Send one more request, once the site has connected — a `get` after the user
 * has worked.
 * @param page - The host's page.
 * @param request - What to send.
 * @param options - See {@link StandInHostWaitOptions}.
 */
export async function sendWhenConnected(
  page: Page,
  request: unknown,
  options: StandInHostWaitOptions = {},
): Promise<void> {
  const { timeout = DEFAULT_TIMEOUT } = options;
  await pollUntil(
    async () =>
      (await page.evaluate(sendStandInHostRequest, request)) ? true : undefined,
    timeout,
    'the site never connected to the host',
  );
}

/**
 * Ask the site for its `figure` output, as a host's Done does, and wait for the
 * answer. The request goes out at once, connected or not.
 * @param page - The host's page.
 * @param id - The request's id.
 * @param options - See {@link StandInHostWaitOptions}.
 * @returns The answer; the SVG is `items[0].value.svg`.
 */
export async function standInHostFigure<T = StandInHostFigureAnswer>(
  page: Page,
  id: string,
  options: StandInHostWaitOptions = {},
): Promise<T> {
  await page.evaluate(sendStandInHostRequest, {
    type: 'get',
    id,
    keys: ['figure'],
  });
  return standInHostAnswer<T>(page, id, options);
}

/**
 * Send a request at once and wait for the one message more it brings, whatever
 * its id.
 * @param page - The host's page.
 * @param request - What to send.
 * @param options - See {@link StandInHostWaitOptions}.
 * @returns The last message, once there is exactly one more than before.
 */
export async function standInHostNextResult<T = unknown>(
  page: Page,
  request: unknown,
  options: StandInHostWaitOptions = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT } = options;
  const earlier = await standInHostResults(page);
  const before = earlier.length;
  await page.evaluate(sendStandInHostRequest, request);
  await pollUntil(
    async () => {
      const results = await standInHostResults(page);
      return results.length === before + 1 ? true : undefined;
    },
    timeout,
    'the site sent no answer',
  );
  const results = await standInHostResults(page);
  return results.at(-1) as T;
}

/**
 * The address the framed site is at now, which is what its share link holds.
 * @param page - The host's page.
 * @param origin - The site's origin.
 * @returns The address, or `''` before its frame has loaded.
 */
export function framedAddress(page: Page, origin: string): string {
  return (
    page
      .frames()
      .find((frame) => frame.url().startsWith(origin))
      ?.url() ?? ''
  );
}

/**
 * The frame showing the site.
 * @param page - The host's page.
 * @param origin - The site's origin.
 * @returns The frame.
 * @throws {Error} When no frame is at the site's origin.
 */
export function framedSite(page: Page, origin: string): Frame {
  const frame = page.frames().find((one) => one.url().startsWith(origin));
  if (frame === undefined) throw new Error('The site is not framed.');
  return frame;
}

/**
 * One query parameter of the framed site's address.
 * @param page - The host's page.
 * @param origin - The site's origin.
 * @param key - The parameter.
 * @returns Its value, or `null` when the address carries none.
 * @throws {Error} When no frame is at the site's origin.
 */
export function framedParameter(
  page: Page,
  origin: string,
  key: string,
): string | null {
  return new URL(framedSite(page, origin).url()).searchParams.get(key);
}

const DEFAULT_TIMEOUT = 5000;
