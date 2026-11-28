/**
 * Asking again until something holds, for the helpers a browser suite calls.
 *
 * Playwright's own `expect.poll` and `toPass` are a value import of
 * `@playwright/test`, which these entries never make: they promise to load no
 * Playwright, and a second copy of it is an error Playwright raises on its own.
 * So the helpers wait with this, on the schedule `expect.poll` keeps.
 */

/** How long to wait between two attempts, then the last one for every later one. */
const INTERVALS = [100, 250, 500, 1000];

/**
 * Call `attempt` until it gives a value, on the schedule `expect.poll` keeps: at
 * once, then after 100, 250, 500 and every 1000 ms. An attempt that throws is
 * one that gave nothing, as it is for `expect.poll`.
 * @param attempt - What to try; `undefined` means "not yet".
 * @param timeout - How long to keep trying, in milliseconds. `0` tries once,
 * and `Infinity` until the test's own timeout ends it.
 * @param failure - What the error says when the time runs out.
 * @returns The first value an attempt gave.
 */
export async function pollUntil<T>(
  attempt: () => Promise<T | undefined>,
  timeout: number,
  failure: string,
): Promise<T> {
  return pollFrom(attempt, Date.now() + timeout, failure, 0);
}

async function pollFrom<T>(
  attempt: () => Promise<T | undefined>,
  deadline: number,
  failure: string,
  round: number,
): Promise<T> {
  let reason = '';
  try {
    const value = await attempt();
    if (value !== undefined) return value;
  } catch (error) {
    reason = error instanceof Error ? `: ${error.message}` : '';
  }
  const left = deadline - Date.now();
  if (left <= 0) throw new Error(`${failure}${reason}`);
  const interval = INTERVALS[Math.min(round, INTERVALS.length - 1)] ?? 1000;
  await new Promise((resolve) => {
    setTimeout(resolve, Math.min(interval, left));
  });
  return pollFrom(attempt, deadline, failure, round + 1);
}
