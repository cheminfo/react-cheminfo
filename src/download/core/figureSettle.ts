/**
 * Knowing when a figure drawn for a file has finished drawing.
 *
 * A chart mounted off the page to be saved at another size does not arrive in
 * one piece: it may render once at a guessed size, measure its box, and render
 * again, and a chart behind a lazy import arrives whenever its chunk does. So
 * nothing here waits a fixed time. The figure is watched frame by frame, and
 * it is taken the moment it has stood still for two frames running.
 */

import { figureSize } from './figureTarget.ts';

/** How the wait is run. */
export interface FigureSettleOptions {
  /**
   * Stops the wait, for a panel closed or a page left while the figure is
   * still drawing.
   * @default undefined — the wait runs to its end
   */
  signal?: AbortSignal;
  /**
   * How many frames the figure is given to settle before the save is given
   * up, about ten seconds at sixty frames a second. It is how a figure that
   * never draws is reported, not how long a slow one is expected to take.
   * @default 600
   */
  maxFrames?: number;
  /**
   * Resolves at the next frame.
   * @default the browser's `requestAnimationFrame`
   */
  nextFrame?: () => Promise<void>;
}

/** How many frames in a row the figure has to hold still. */
const STILL_FRAMES = 2;

/** What {@link FigureSettleOptions.maxFrames} is unless the caller says. */
const DEFAULT_MAX_FRAMES = 600;

/**
 * Wait until the figure mounted in a box has finished drawing.
 * @param element - The box the figure is being drawn in.
 * @param options - See {@link FigureSettleOptions}.
 * @returns Resolves once the figure has stood still.
 * @throws {Error} When the wait is stopped, or the figure never settles.
 */
export async function whenFigureSettles(
  element: Element,
  options: FigureSettleOptions = {},
): Promise<void> {
  let changes = 0;
  const observer = new MutationObserver(() => {
    changes++;
  });
  observer.observe(element, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  try {
    await settle(() => {
      const size = figureSize(element);
      return size === null ? null : `${changes}:${size.width}×${size.height}`;
    }, options);
  } finally {
    observer.disconnect();
  }
}

/**
 * Wait until a reading of the figure comes back the same frames in a row.
 *
 * The reading is whatever says the figure has changed — for a drawing on the
 * page, how many times it was touched and the size it came out at — and
 * `null` while there is nothing drawn yet.
 * @param read - Takes the reading.
 * @param options - See {@link FigureSettleOptions}.
 * @returns Resolves once the reading has held.
 * @throws {Error} When the wait is stopped, or the reading never holds.
 */
export async function settle(
  read: () => string | null,
  options: FigureSettleOptions = {},
): Promise<void> {
  const { signal, maxFrames = DEFAULT_MAX_FRAMES } = options;
  const { nextFrame = animationFrame } = options;

  let last: string | null = null;
  let still = 0;
  for (let frame = 0; frame < maxFrames; frame++) {
    // eslint-disable-next-line no-await-in-loop -- each frame is compared with the one before it
    await nextFrame();
    if (signal?.aborted) throw new Error('The figure was not saved.');
    const reading = read();
    still = reading !== null && reading === last ? still + 1 : 0;
    if (still >= STILL_FRAMES) return;
    last = reading;
  }
  throw new Error('The figure did not finish drawing, so nothing was saved.');
}

/**
 * The next frame the browser paints.
 * @returns Resolves at that frame.
 */
function animationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
