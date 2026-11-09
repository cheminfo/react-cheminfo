import type { DemoPoint } from './demoEvents.ts';

/**
 * What a demo points at: an element, a CSS selector, a point of the page, or
 * a function answering either — read again until it answers, since what a
 * step points at is often what the step before it made.
 */
export type DemoTarget =
  Element | string | DemoPoint | (() => Element | DemoPoint | null | undefined);

/**
 * A point inside a target's box, as shares of its width and height: a canvas
 * is clicked where something should land, not at its middle.
 * @param target - The element, or how to find it.
 * @param x - From its left edge, `0` to `1`.
 * @param y - From its top edge, `0` to `1`.
 * @returns A target the demo can point at.
 */
export function pointIn(
  target: Element | string | (() => Element | null | undefined),
  x: number,
  y: number,
): DemoTarget {
  return () => {
    const element = toElement(target);
    if (element === null) return null;
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return null;
    return { x: box.left + box.width * x, y: box.top + box.height * y };
  };
}

/**
 * Where a target is, waiting for it to be there.
 * @param target - What to find.
 * @param signal - Stops the wait.
 * @param timeout - How long to wait, in milliseconds.
 * @returns Its point: an element's middle, scrolled into view first.
 */
export async function locate(
  target: DemoTarget,
  signal: AbortSignal,
  timeout = LOCATE_TIMEOUT_MS,
): Promise<DemoPoint> {
  const until = performance.now() + timeout;
  for (;;) {
    signal.throwIfAborted();
    const point = pointOf(target);
    if (point !== null) return point;
    if (performance.now() > until) {
      throw new Error(`The demo found nothing at ${describe(target)}.`);
    }
    // eslint-disable-next-line no-await-in-loop -- polled until it appears, on purpose
    await new Promise(requestAnimationFrame);
  }
}

/** How long a step waits for what it points at, before it gives up. */
const LOCATE_TIMEOUT_MS = 4000;

function pointOf(target: DemoTarget): DemoPoint | null {
  const found = typeof target === 'function' ? target() : target;
  if (found === null || found === undefined) return null;
  if (typeof found === 'string' || found instanceof Element) {
    const element = toElement(found);
    if (element === null) return null;
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return null;
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  return found;
}

function toElement(
  target: Element | string | (() => Element | null | undefined),
): Element | null {
  if (typeof target === 'string') return document.querySelector(target);
  if (typeof target === 'function') return target() ?? null;
  return target;
}

function describe(target: DemoTarget): string {
  if (typeof target === 'string') return `"${target}"`;
  if (typeof target === 'function') return 'the place a step looks for';
  if (target instanceof Element) return 'an element no longer on the page';
  return `(${Math.round(target.x)}, ${Math.round(target.y)})`;
}
