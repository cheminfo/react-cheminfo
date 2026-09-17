/**
 * What the gesture tests drive the surface with.
 *
 * There is no DOM in this suite, so a press is a plain object carrying the
 * three fields the surface reads, and a hook is run once rather than rendered:
 * a setter called afterwards is a no-op, and every change is asserted through
 * the callback the hook reports it on.
 */

import type { MouseEvent, PointerEvent, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PARALLEL_MARGIN } from '../../core/parallelAxes.ts';
import type { ParallelGesture } from '../useParallelGesture.ts';

/** The rectangle the figure lays over itself, at the origin of the page. */
const SURFACE = {
  getBoundingClientRect: () => ({ left: 0, top: 0 }),
} as unknown as Element;

/**
 * A pointer event at a place in the drawing area, as the surface sees it.
 * @param x - Pixels from the left of the drawing area.
 * @param y - Pixels from its top.
 * @returns As much of a pointer event as the surface reads.
 */
export function pointerAt(x: number, y: number): PointerEvent<Element> {
  return {
    pointerId: 1,
    button: 0,
    pointerType: 'mouse',
    currentTarget: SURFACE,
    clientX: x + PARALLEL_MARGIN.left,
    clientY: y + PARALLEL_MARGIN.top,
  } as unknown as PointerEvent<Element>;
}

/**
 * The same event, where a click is what is under test.
 * @param x - Pixels from the left of the drawing area.
 * @param y - Pixels from its top.
 * @returns As much of a mouse event as the surface reads.
 */
export function mouseAt(x: number, y: number): MouseEvent<Element> {
  return pointerAt(x, y);
}

/**
 * Press, move and let go, which is the whole of a brush gesture.
 * @param gesture - The gesture under test.
 * @param from - Where the press lands, in the drawing area.
 * @param from.x - Pixels from the left of the drawing area.
 * @param from.y - Pixels from its top.
 * @param to - Where the pointer is let go.
 * @param to.x - Pixels from the left of the drawing area.
 * @param to.y - Pixels from its top.
 */
export function drag(
  gesture: ParallelGesture,
  from: { x: number; y: number },
  to: { x: number; y: number },
): void {
  gesture.surface.onPointerDown(pointerAt(from.x, from.y));
  gesture.surface.onPointerMove(pointerAt(to.x, to.y));
  gesture.surface.onPointerUp(pointerAt(to.x, to.y));
}

/**
 * Run a hook once and keep what it returned.
 * @param useHook - The hook to run, with its options.
 * @param view - What the probe draws, for the tests that read markup.
 * @returns What the hook returned, and the markup.
 */
export function probe<T>(
  useHook: () => T,
  view?: (value: T) => ReactNode,
): { value: T; html: string } {
  const held: T[] = [];
  function Probe() {
    const value = useHook();
    held.push(value);
    return view === undefined ? null : <>{view(value)}</>;
  }
  const html = renderToStaticMarkup(<Probe />);
  return { value: held[0] as T, html };
}
