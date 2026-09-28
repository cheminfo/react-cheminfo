/**
 * Where the pointer is over a chart, and what that place means.
 *
 * What it *means* is the one thing this hook does not decide. A mass spectrum
 * reads an m/z, an intensity and the peak within reach; an infrared spectrum
 * reads a wavenumber, an absorbance and the band it falls in. Both are the same
 * mechanism — place the pointer in user units, refuse the margins, and report
 * only when the answer changed — so the mechanism is here and the reading is
 * handed in.
 *
 * Every value is compared before it is stored or reported. A pointer resting on
 * one feature fires `pointermove` on every sub-pixel tremor of a hand, and a
 * fresh answer each time would re-render the panel beside the chart — and, where
 * that panel is a linked viewer that reports its own hovers back, would
 * ping-pong between the two until the tab stops answering.
 */

import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { PlotRect } from '../core/chartGeometry.ts';
import type { ChartPoint } from '../core/svgPoint.ts';
import { svgPointAt } from '../core/svgPoint.ts';

/** Where the pointer is, and what that place means. */
export interface ChartPointer<TReadout> {
  /** Its position in user units, `null` whenever it is off the plot. */
  position: ChartPoint | null;
  /** What the chart reads under it, `null` whenever it is off the plot. */
  readout: TReadout | null;
}

export interface ChartPointerOptions<TReadout> {
  /** The SVG the chart is drawn on, as it was handed to its `ref`. */
  svgRef: RefObject<SVGSVGElement | null>;
  /**
   * Where the plot sits inside that SVG. The pointer is only followed inside
   * it: the margins carry the axis labels, and a crosshair drawn across them
   * claims to read a value off a place where none is drawn.
   */
  plot: PlotRect;
  /**
   * What the chart reads at a point. Called on every move the pointer makes
   * inside the plot, and read live rather than closed over, so it may capture
   * the scales as they are currently zoomed.
   */
  read: (point: ChartPoint) => TReadout;
  /**
   * Whether two readings say the same thing, which is what suppresses the
   * report of a hand resting still.
   *
   * A viewer normally compares less than the whole reading: the pointer's own
   * position has already been compared by the time this is asked, so what is
   * left is whichever *feature* the reading is about — the peak, the band — and
   * not the fractional value under the crosshair, which changes on every pixel.
   */
  sameReadout: (current: TReadout, next: TReadout) => boolean;
  /**
   * Told what the chart reads under the pointer, and told `null` when it leaves
   * the plot — called only when `sameReadout` says the answer changed, so it is
   * safe to hang a highlight that redraws half the page on it.
   * @default undefined
   */
  onReadout?: (readout: TReadout | null) => void;
}

/**
 * Follow the pointer over a chart.
 *
 * The listeners are attached to the element rather than returned as props, so
 * that a chart already spreading another hook's `onPointerMove` onto its SVG
 * does not have to merge two handlers into one — and so that the options are
 * read live, at the moment the pointer moves, rather than closed over when the
 * listener was attached.
 *
 * The pointer leaving is heard as `pointerout` and not as the `pointerleave`
 * that reads so much more naturally, because a chart with a control laid over
 * it — a legend whose rows answer a hover — has two writers of one highlight
 * and they must be sequenced. React synthesises the overlay's `pointerenter`
 * from the *earlier* `pointerout` and dispatches it at the root, so a browser
 * fires `pointerout` on the SVG, then React's `onPointerEnter` on the row, then
 * `pointerleave` on the SVG: listening for the leave puts this hook's "nothing
 * is under the pointer" **after** the row's "this trace is being read", and
 * wipes it. Heard as `pointerout`, the report lands first and the row has the
 * last word. The containment test is what `pointerleave` was giving for free.
 * @param options - The chart, and how to read a point on it.
 * @returns Where the pointer is and what it reads, both `null` while it is
 * anywhere but over the plot.
 */
export function useChartPointer<TReadout>(
  options: ChartPointerOptions<TReadout>,
): ChartPointer<TReadout> {
  const { svgRef } = options;
  const [pointer, setPointer] = useState<ChartPointer<TReadout>>(POINTER_AWAY);
  const latest = useRef(options);
  const reported = useRef<TReadout | null>(null);

  useLayoutEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (svg === null) return;

    function show(next: ChartPointer<TReadout>): void {
      const { sameReadout, onReadout } = latest.current;
      setPointer((current) => nextChartPointer(current, next, sameReadout));
      if (sameReading(reported.current, next.readout, sameReadout)) return;
      reported.current = next.readout;
      onReadout?.(next.readout);
    }

    function move(event: PointerEvent): void {
      const { plot, read } = latest.current;
      const point = svgPointAt(svg, event.clientX, event.clientY);
      show(
        point === null || !isInsidePlot(plot, point)
          ? POINTER_AWAY
          : { position: point, readout: read(point) },
      );
    }

    function out(event: PointerEvent): void {
      if (leftChart(svg, event.relatedTarget)) show(POINTER_AWAY);
    }

    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerout', out);
    return () => {
      svg.removeEventListener('pointermove', move);
      svg.removeEventListener('pointerout', out);
    };
  }, [svgRef]);

  return pointer;
}

/**
 * Whether a `pointerout` means the pointer has left the chart.
 *
 * It also fires on the way *into* a child of the SVG — a trace, a label, the
 * rectangle behind a legend — which is not leaving the chart at all, and is the
 * one thing `pointerleave` was giving for free.
 * @param svg - The chart, `null` before it is on screen.
 * @param related - What the pointer moved onto, `null` when it left the window
 * altogether.
 * @returns Whether the chart no longer has the pointer.
 */
export function leftChart(
  svg: Element | null,
  related: EventTarget | null,
): boolean {
  if (svg === null) return true;
  return !(related instanceof Node) || !svg.contains(related);
}

/**
 * Whether two readings — either of which may be absent — say the same thing.
 * @param current - What was last read, `null` while the pointer was away.
 * @param next - What has just been read, `null` when it has left the plot.
 * @param sameReadout - The viewer's own comparison.
 * @returns Whether the report can be skipped.
 */
export function sameReading<TReadout>(
  current: TReadout | null,
  next: TReadout | null,
  sameReadout: (current: TReadout, next: TReadout) => boolean,
): boolean {
  if (current === next) return true;
  if (current === null || next === null) return false;
  return sameReadout(current, next);
}

/**
 * What to hold, given where the pointer has just been seen.
 *
 * The answer already held comes back whenever it still stands, so the whole
 * chart is left alone while a hand rests on a feature — `pointermove` fires on
 * every tremor, and several of those land on the very same user-unit position.
 * @param current - What is held.
 * @param next - What has just been read.
 * @param sameReadout - The viewer's own comparison, asked only once the pointer
 * turns out not to have moved.
 * @returns `current` itself when it already says it, `next` otherwise.
 */
export function nextChartPointer<TReadout>(
  current: ChartPointer<TReadout>,
  next: ChartPointer<TReadout>,
  sameReadout: (current: TReadout, next: TReadout) => boolean,
): ChartPointer<TReadout> {
  if (current === next) return current;
  if (current.position === null || next.position === null) {
    return current.position === next.position ? current : next;
  }
  if (
    current.position.x !== next.position.x ||
    current.position.y !== next.position.y
  ) {
    return next;
  }
  return sameReading(current.readout, next.readout, sameReadout)
    ? current
    : next;
}

/**
 * Whether a point is over the data rather than over an axis.
 * @param plot - Where the plot sits inside the SVG.
 * @param point - The point to test, in user units.
 * @returns Whether it is inside the plot, edges included.
 */
export function isInsidePlot(plot: PlotRect, point: ChartPoint): boolean {
  return (
    point.x >= plot.left &&
    point.x <= plot.right &&
    point.y >= plot.top &&
    point.y <= plot.bottom
  );
}

/** What is held while the pointer is anywhere but over the plot. */
const POINTER_AWAY: ChartPointer<never> = { position: null, readout: null };
