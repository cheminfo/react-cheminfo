/** What working something out came to: its value, or what was thrown. */
export type ReadOutcome<T> =
  { ok: true; value: T } | { ok: false; error: unknown };

/**
 * Work something out that may throw, inside a `useMemo`: what a calculator
 * reads its input with, so the page shows the answer or the problem.
 * @param read - What works it out.
 * @returns The value, or the error.
 */
export function readOutcome<T>(read: () => T): ReadOutcome<T> {
  try {
    return { ok: true, value: read() };
  } catch (error) {
    return { ok: false, error };
  }
}
