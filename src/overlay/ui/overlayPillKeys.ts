/**
 * How a keyboard moves along a row of pills.
 *
 * A pill group is a list laid out sideways, so the arrows that mean something
 * to the reader are the horizontal ones — and the shared list navigation is
 * written for a column. Rather than a second key handler that would drift from
 * it, the two horizontal keys are read as the vertical ones and everything
 * else is handed straight over: `Home` and `End` reach the two ends, the
 * selection is clamped at both, and a key the list has no use for is left to
 * the page.
 */

import type {
  ListNavigationHandlerOptions,
  ListNavigationKeyEvent,
} from '../../hooks/ui/listNavigation.ts';
import { handleListNavigationKey } from '../../hooks/ui/listNavigation.ts';

/**
 * Move a pill group's selection from a keyboard event.
 * @param event - The keyboard event, synthetic or native.
 * @param options - See {@link ListNavigationHandlerOptions}.
 */
export function handleOverlayPillKey(
  event: ListNavigationKeyEvent,
  options: ListNavigationHandlerOptions,
): void {
  handleListNavigationKey(
    {
      key: SIDEWAYS_KEYS[event.key] ?? event.key,
      target: event.target,
      // Written out rather than spread from the event: `preventDefault` lives
      // on the event's prototype, and a copy made by spreading arrives without
      // it — at which point the page scrolls under every arrow key.
      preventDefault: () => event.preventDefault(),
    },
    options,
  );
}

/** The keys a sideways list is walked with, in the terms a column is. */
const SIDEWAYS_KEYS: Readonly<Record<string, string>> = {
  ArrowLeft: 'ArrowUp',
  ArrowRight: 'ArrowDown',
};
