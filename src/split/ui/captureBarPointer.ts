import type { PointerEvent as ReactPointerEvent } from 'react';

/**
 * Hands the pointer to react-science's bar when a drag starts on it.
 *
 * The bar follows `pointermove` on the window and never captures the pointer,
 * so once the pointer crosses an iframe in the next pane, the frame's own page
 * takes every move and the release: the bar stops, and the drag is left stuck
 * to the pointer. Captured, the events keep coming to the bar and still bubble
 * to the window it listens on.
 *
 * Temporary: react-science is to capture the pointer itself
 * (zakodium-oss/react-science, branch `fix-split-pane-iframe-drag`). The test
 * beside this file fails on the day the installed version does. Then this
 * file, that test and the `onPointerDown` that calls it are deleted, and the
 * react-science peer range starts at that release: a site resolves its own
 * copy, and every release the range allows today leaves the bar uncaptured.
 * @param event - A pointer pressed somewhere in the row.
 */
export function captureBarPointer(
  event: ReactPointerEvent<HTMLDivElement>,
): void {
  // The row wraps react-science's container: its first pane, the bar, its
  // second pane.
  const { currentTarget, pointerId, target } = event;
  const bar = currentTarget.firstElementChild?.children[1];
  if (
    bar instanceof HTMLElement &&
    target instanceof Node &&
    bar.contains(target)
  ) {
    bar.setPointerCapture(pointerId);
  }
}
