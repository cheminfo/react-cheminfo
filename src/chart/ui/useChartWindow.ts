/**
 * The window a chart is looking through, and the two scales it is read by.
 *
 * Three things can decide what is on screen — the fit the data asks for, the
 * window a gesture arrived at, and a window a host imposes — and the whole of
 * the policy that settles between them is here, away from the gestures, because
 * it is the half that has nothing to do with a pointer. A chart put back to its
 * fit by a toolbar button and one put back by a double click are the same event
 * to this hook.
 *
 * The scales come out of the same place for a reason that shipped broken once:
 * every gesture is measured by inverting a pixel, so a chart drawing a reversed
 * axis while the gestures were measured through an ascending one zoomed to the
 * mirror image of whatever was dragged over. Held here, beside the window they
 * are built from, there is only ever one mapping to disagree with.
 */

import { useCallback, useMemo, useState } from 'react';

import type { ChartDomain } from '../core/chartDomain.ts';
import { sameChartDomain } from '../core/chartDomain.ts';
import type { PlotRect } from '../core/chartGeometry.ts';
import type { ChartScale } from '../core/chartScale.ts';
import { chartScale } from '../core/chartScale.ts';

/** The fit, the window a host imposes, and the box both are drawn into. */
export interface ChartWindowOptions {
  /**
   * The window that shows everything currently drawn, as the viewer fits it.
   * This is what a double click goes back to.
   */
  fitted: ChartDomain;
  /**
   * What that fit was made *to*, as one string two renders can compare.
   *
   * The window is put back to the fit whenever this changes and never otherwise,
   * so it must name the data and not its extents: a spectrum switched from one
   * unit to another, or from its profile to its sticks, moves the fitted extents
   * by a hair, and refitting on a hair throws away the zoom somebody set.
   */
  fitKey: string;
  /**
   * What the **value axis alone** was fitted to, for a chart whose height is
   * fitted to something that changes under a window the reader is keeping.
   *
   * A loading spectrum is the case it was written for. The reader zooms onto a
   * few masses and then steps through the components, and the m/z window is
   * where they are looking rather than a fact about the component being read —
   * so it stays. The loading axis is fitted to the component's own scale, and
   * cannot: drawn through the last component's window, a diffuse component is a
   * flat line along the middle and a concentrated one is cut off at the top.
   * @default `fitKey`, so the value axis moves only when the whole fit does
   */
  yFitKey?: string;
  /** Where the plot sits inside the SVG, which the axes are laid over. */
  plot: PlotRect;
  /**
   * The window a host is imposing, `null` while it imposes none.
   *
   * It is handed *in* rather than merely shown beside the chart's own, so that
   * every gesture is measured against what is actually on screen. A peak table
   * that frames a value, a handle that zooms to one: both put a window on the
   * chart that the chart did not arrive at, and a drag worked out against the
   * window the chart last held instead would zoom to somewhere else entirely.
   * It is taken up when it *changes*, not held over the chart's own — see the
   * hook itself for why that distinction is the difference between a chart that
   * zooms and one that zooms once.
   * @default null
   */
  domain?: ChartDomain | null;
  /**
   * Whether the horizontal axis is drawn right to left, as an infrared
   * spectrum's wavenumbers are.
   *
   * It has to be said **here**, and this is the one option a viewer cannot get
   * away with handling on its own: a chart that drew a reversed axis while the
   * gestures were measured through an ascending one would zoom to the mirror
   * image of whatever was dragged over. The scales are handed back for exactly
   * that reason — draw with those and the two cannot disagree.
   * @default false
   */
  reverseX?: boolean;
}

/** The window, how it maps to pixels, and the two ways it moves. */
export interface ChartWindow {
  /** What the chart is showing. */
  domain: ChartDomain;
  /** The horizontal axis, already accounting for a reversed one. */
  xScale: ChartScale;
  /** The vertical axis, which runs backwards because SVG counts downwards. */
  yScale: ChartScale;
  /** Show a window a gesture arrived at. */
  show: (domain: ChartDomain) => void;
  /** Put the window back to everything that is drawn. */
  reset: () => void;
}

/**
 * Hold the window a chart shows, and map it to the plot.
 *
 * The window is put back to what fits whenever the chart is handed **different
 * data** — a spectrum loaded, one closed, the chart reflected about zero — and
 * is otherwise left exactly where it was. That distinction is the whole of the
 * behaviour, and `fitKey` is where it is drawn: the same spectra drawn
 * differently is the same data, and a chart that refitted on it would throw away
 * the window somebody had zoomed to for a change of a fraction of a percent in
 * the extents.
 *
 * The value axis can be refitted on its own, by `yFitKey`, for the one chart
 * where the two halves of the window answer to different things: a component's
 * loadings are drawn on the component's own scale, while the masses on screen
 * are where the reader chose to look and have nothing to do with which
 * component is being read. Everywhere else it is the whole fit that moves, so
 * it defaults to `fitKey` and nothing has to be said.
 *
 * A window a host imposes is **taken up as it changes**, and is not held over
 * the window kept here. A host is told every window the chart arrives at and is
 * expected to hand that same window back, so what it imposes is, in the ordinary
 * case, the answer to the *last* gesture. Held over the top, that answer would
 * be the answer to the next one as well — the chart would zoom once, report it,
 * and then stand still, with every later drag and turn of the wheel worked out
 * and thrown away.
 *
 * Handing back `null` where a window was is how a host asks for the fit again —
 * the only thing it is ever told is a window, so that is the one way it has of
 * saying it. That is what "zoom to fit" pressed on a toolbar beside the chart
 * comes down to.
 *
 * New data refits the **value axis** of whatever a host is imposing, and leaves
 * the horizontal half of it alone. A host that stores every window it is told
 * and hands the same one back is imposing one at every moment after the first
 * gesture, so a refit that waited for it to stop would never happen at all: a
 * chart reflected about zero would draw its mirrored half below the foot of the
 * plot, where the clip path swallows it. But the horizontal axis is where the
 * reader chose to look, and by the time data arrives with a window still
 * imposed the host has already decided the two belong together — every route in
 * gives its own window up when what arrived does not belong in it, and there is
 * then nothing imposed here to keep. What is left is another scan of the run
 * being stepped through, or another pixel of the section being compared, and
 * refitting those out of the window they are being compared in is the one thing
 * the gesture that added them was not asking for. A host imposing a *different*
 * window in the same render still wins outright, since it is asking for that
 * window of the data just handed over.
 *
 * The imposed window is compared by value rather than by identity, so a host
 * that rebuilds an equal window on every render neither fights the gestures nor
 * renders forever. Both comparisons are made while rendering rather than in an
 * effect: an effect would draw the stale window for one frame, and setting state
 * from one is what `react-hooks/set-state-in-effect` forbids.
 * @param options - The fit, the plot, and the window a host imposes.
 * @returns The window, its two scales, and the two ways it is moved.
 */
export function useChartWindow(options: ChartWindowOptions): ChartWindow {
  const {
    fitted,
    fitKey,
    yFitKey = fitKey,
    plot,
    domain: imposed = null,
    reverseX = false,
  } = options;

  // What the chart shows, and the one thing every gesture moves.
  const [held, setHeld] = useState<ChartDomain>(imposed ?? fitted);

  const [fittedFor, setFittedFor] = useState(fitKey);
  if (fittedFor !== fitKey) {
    setFittedFor(fitKey);
    // The horizontal half of a window a host is still imposing survives the
    // refit; only the value axis is refitted. A host that wanted the whole
    // window given up has already given it up — every route in clears its own
    // window when the data that arrived does not belong in it, and then there
    // is nothing imposed here to keep. What is left is the case where it does
    // belong: another scan of the run being stepped through, another pixel of
    // the section being compared. Refitting x there throws away the very
    // window the reader is comparing *in*, which is the whole point of the
    // gesture that added it.
    //
    // The value axis is refitted all the same, and must be: a chart reflected
    // about zero, or one a brighter trace has just joined, is drawn against a
    // height that has genuinely changed, and keeping the old one hides the new
    // data below the foot of the plot or off the top of it.
    setHeld((current) =>
      imposed === null ? fitted : { x: current.x, y: fitted.y },
    );
  }

  const [yFittedFor, setYFittedFor] = useState(yFitKey);
  if (yFittedFor !== yFitKey) {
    setYFittedFor(yFitKey);
    // Mapped over whatever the refit above may just have set, rather than over
    // the window this render read, so that both keys changing at once is the
    // whole fit and not the last window's x with a new height on it.
    setHeld((current) => ({ x: current.x, y: fitted.y }));
  }

  const [imposedShown, setImposedShown] = useState(imposed);
  if (!sameImposedDomain(imposedShown, imposed)) {
    setImposedShown(imposed);
    setHeld(imposed ?? fitted);
  }

  const domain = held;

  // Reversed by handing the range over backwards, which is the whole of drawing
  // an axis right to left.
  const xScale = useMemo(
    () =>
      reverseX
        ? chartScale(domain.x[0], domain.x[1], plot.right, plot.left)
        : chartScale(domain.x[0], domain.x[1], plot.left, plot.right),
    [domain.x, plot.left, plot.right, reverseX],
  );
  // Backwards, since SVG counts pixels downwards while a value counts up.
  const yScale = useMemo(
    () => chartScale(domain.y[0], domain.y[1], plot.bottom, plot.top),
    [domain.y, plot.bottom, plot.top],
  );

  const reset = useCallback(() => {
    setHeld(fitted);
  }, [fitted]);

  return { domain, xScale, yScale, show: setHeld, reset };
}

/**
 * Whether a host is imposing the same window it was imposing before.
 * @param current - The window it imposed last, `null` when it imposed none.
 * @param next - The window it imposes now, `null` for none.
 * @returns Whether both say the same thing.
 */
function sameImposedDomain(
  current: ChartDomain | null,
  next: ChartDomain | null,
): boolean {
  if (current === null || next === null) return current === next;
  return sameChartDomain(current, next);
}
