/**
 * Give the browser a turn, in the middle of work that would otherwise hold it.
 *
 * A long read that reports its progress reports it into a page that never gets
 * to draw: awaiting a value already in hand queues a microtask, and the browser
 * paints between tasks, not between microtasks. So a loop over a run held in
 * memory can walk twenty-six million peaks announcing each percent and leave
 * the screen showing the percent it was at when the loop began.
 *
 * `setTimeout` and not `requestAnimationFrame`, for two reasons: these packages
 * are tested without a DOM, so work that only advanced inside a browser could
 * not be tested at all; and a tab in the background stops painting frames
 * altogether, which would stop a read its owner is waiting for.
 * @returns When the browser has had its turn.
 */
export function yieldToPainting(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
