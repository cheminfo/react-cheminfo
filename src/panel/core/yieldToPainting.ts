import { yieldToBrowser } from '../../worker/core/chunks.ts';

/**
 * Give the browser a turn, in the middle of work that would otherwise hold it.
 *
 * A long read that reports its progress reports it into a page that never gets
 * to draw: awaiting a value already in hand queues a microtask, and the browser
 * paints between tasks, not between microtasks. So a loop over a run held in
 * memory can walk twenty-six million peaks announcing each percent and leave
 * the screen showing the percent it was at when the loop began.
 *
 * It is {@link yieldToBrowser}: a timeout, or a message in a background tab,
 * which holds timeouts to one a second.
 * @returns When the browser has had its turn.
 */
export function yieldToPainting(): Promise<void> {
  return yieldToBrowser();
}
