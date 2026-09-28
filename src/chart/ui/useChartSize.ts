/**
 * How big the box a chart was handed is, followed for as long as it is on
 * screen.
 *
 * The element is measured from the `ref` rather than from an effect, so the
 * observer is re-attached every time the element goes away and comes back —
 * which is the whole point of doing it here. A chart living in a folded
 * accordion panel is unmounted while the panel is shut; an observer bound once
 * at mount would be watching an element nobody kept, so the chart returns
 * measuring nothing, builds its scales on a plot of `MINIMUM_PLOT_SIDE`, and
 * stays that way until the window itself happens to be resized. Measuring in
 * the callback also means the size is known in the same commit the element
 * appears in, so nothing is ever painted at a size that is about to change.
 */

import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useRef, useState } from 'react';

import type { ChartSize } from '../core/chartGeometry.ts';

/** The `ref` to put on the wrapper, and how big that wrapper is. */
export type ChartSizeHandle<T extends Element> = [
  ref: (element: T | null) => void,
  size: ChartSize,
];

/**
 * Follow the size of the element a chart is drawn in.
 *
 * The `ref` never changes between renders, so React attaches it once per
 * element rather than detaching and re-attaching it — and a detach here is not
 * free, since it is what tears the observer down.
 * @returns The `ref`, and the size — `0 × 0` until the element is on screen,
 * which every first render sees.
 */
export function useChartSize<
  T extends Element = HTMLDivElement,
>(): ChartSizeHandle<T> {
  const observer = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState<ChartSize>(NO_SIZE);

  const measure = useCallback((element: T | null) => {
    // Torn down here rather than from a cleanup returned to React: only React
    // 19 runs one, where React 18 calls the ref with `null` instead — so
    // detaching on `null` is what disconnects the observer under both.
    observer.current?.disconnect();
    observer.current = null;
    if (element === null) return;

    read(element, setSize);
    // Absent outside a browser, where nothing is on screen to be resized.
    if (typeof ResizeObserver === 'undefined') return;
    observer.current = new ResizeObserver(() => {
      read(element, setSize);
    });
    observer.current.observe(element);
  }, []);

  return [measure, size];
}

/**
 * The size to hold, given what the element has just been measured at.
 *
 * The one already held comes back when the numbers have not moved, so a
 * resize that changes nothing — a splitter dragged and let go where it was, a
 * panel folded and unfolded at the same width — costs a comparison rather than
 * a render of the whole chart, which rebuilds every scale and re-lays every
 * label out.
 *
 * A measurement that is not a size is read as nothing at all: a negative width
 * is impossible, and a `NaN` one is what an element that is not laid out gives.
 * Either would travel into `plotRect` and out the far side as an infinity.
 * @param current - The size held so far.
 * @param width - What the element has just been measured at, horizontally.
 * @param height - What it has just been measured at, vertically.
 * @returns `current` itself when nothing moved, the new size otherwise.
 */
export function nextChartSize(
  current: ChartSize,
  width: number,
  height: number,
): ChartSize {
  const nextWidth = usableSide(width);
  const nextHeight = usableSide(height);
  if (current.width === nextWidth && current.height === nextHeight) {
    return current;
  }
  return { width: nextWidth, height: nextHeight };
}

/** What a chart is given before its element has ever been laid out. */
const NO_SIZE: ChartSize = { width: 0, height: 0 };

/**
 * Measure an element and hold what it says.
 * @param element - The wrapper the chart is drawn in.
 * @param setSize - Where the measurement goes.
 */
function read(
  element: Element,
  setSize: Dispatch<SetStateAction<ChartSize>>,
): void {
  const { width, height } = element.getBoundingClientRect();
  setSize((current) => nextChartSize(current, width, height));
}

/**
 * One side of a measurement, as a size rather than as a number.
 * @param value - What the element was measured at.
 * @returns The side, `0` for anything that is not a length.
 */
function usableSide(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}
