/**
 * Where the plot sits inside the SVG, and in what order its bands are painted.
 *
 * The margins are deliberately not symmetric, because the two axes ask for very
 * different room: a value label runs to `1.2e6` and needs the width on the
 * left, while the horizontal axis carries its ticks and its title stacked under the
 * plot. Nothing here is responsive — whatever lays the chart out decides how big
 * it is, and this module only says what is left over for the data.
 */

/** The box a chart was given, in CSS pixels. */
export interface ChartSize {
  /** How wide the SVG is. */
  width: number;
  /** How tall the SVG is. */
  height: number;
}

/**
 * The plotting area inside the margins, in SVG user units.
 *
 * `right` and `bottom` are carried rather than recomputed at each use: a clip
 * path, the brush rectangle and both axes all need the far edge, and three
 * copies of `left + width` are three chances for one of them to drift.
 */
export interface PlotRect {
  /** Distance from the left edge of the SVG to the plot. */
  left: number;
  /** Distance from the top edge of the SVG to the plot. */
  top: number;
  /** How wide the plot is, never below `MINIMUM_PLOT_SIDE`. */
  width: number;
  /** How tall the plot is, never below `MINIMUM_PLOT_SIDE`. */
  height: number;
  /** `left + width`, where the horizontal axis ends. */
  right: number;
  /** `top + height`, the baseline the horizontal axis is drawn on. */
  bottom: number;
}

/**
 * The four sides of the room kept around a plot, in CSS pixels.
 *
 * Named as a type of its own because `MARGIN` is frozen at literal values, so a
 * caller asking for `{ bottom: 4 }` would be told that 4 is not 34 — the
 * defaults are constants, but a margin is four numbers.
 */
export interface ChartMargin {
  /** Room above the plot. */
  top: number;
  /** Room to the right of the plot. */
  right: number;
  /** Room below the plot, where the horizontal axis is written. */
  bottom: number;
  /** Room to the left of the plot, where the value axis is written. */
  left: number;
}

/**
 * The room kept around the plot for the axes and their titles.
 *
 * `left` is the widest because it has to hold a value label; `bottom` is
 * deeper than `top` because it stacks the tick labels and the axis title under
 * the plot, where `top` only keeps the topmost value label off the edge.
 *
 * Each of them is the furniture and no more than the furniture. `Axes` writes
 * its tick row five pixels under the plot and its title thirteen under that,
 * which puts the deepest ink of a `(min)` some thirty pixels down; what is left
 * is slack. A stack pays these four numbers once per pane — a column of three
 * chromatograms over a spectrum pays `bottom` four times — and a pixel of slack
 * in here is a pixel the measurement was not drawn in, over and over.
 */
export const MARGIN = { top: 10, right: 16, bottom: 34, left: 60 } as const;

/**
 * How much room a chart leaves under its plot when it writes no horizontal axis
 * of its own.
 *
 * A pane of a stack above the foot draws no tick row and no axis title — the
 * panes share one window, so one axis under the last of them says everything —
 * and this is what it keeps instead: enough that the trace does not run into
 * the splitter under it, and no more. It lives here beside `MARGIN` rather than
 * in the viewer that uses it, because the arithmetic that shares a stack's
 * height between its panes has to subtract exactly the difference between the
 * two, and a second copy of either number is a stack whose plots do not line up.
 */
export const SHARED_AXIS_MARGIN = 8;

/**
 * The smallest plot the arithmetic is allowed to describe.
 *
 * A chart is briefly laid out at nothing — a panel opening, a splitter dragged
 * shut, the first render before the container has been measured — and the naive
 * subtraction then gives a negative width, which every scale built from it turns
 * into an infinity and the DOM refuses outright. Ten pixels is small enough to
 * be invisible and large enough to keep every number finite until the real size
 * arrives.
 */
export const MINIMUM_PLOT_SIDE = 10;

/**
 * The six bands of the chart, bottom to top, in the order they are painted.
 *
 * The order is the whole interaction design in one array. `defs` holds the clip
 * paths and markers and is never painted itself. `axes` sits under the data so a
 * grid line can never be mistaken for a peak. `data` is the only clipped band,
 * so a zoomed trace stops at the plot edge instead of running out over the
 * labels — which is also why `guide` is separate: an annotation's label sits
 * above the tallest peak and must be allowed out of the clip. `selection` covers
 * the data so a drag stays visible over it, and `tracker` is last so the
 * crosshair and its readout are never occluded by anything.
 */
export const CHART_LAYERS = [
  'defs',
  'axes',
  'data',
  'guide',
  'selection',
  'tracker',
] as const;

/** One band of the chart. */
export type ChartLayer = (typeof CHART_LAYERS)[number];

/**
 * Work out the plotting area for a chart of a given size.
 * @param size - The box the chart was given.
 * @param margin - Room to keep around the plot instead of the module default.
 * Whatever side it names is used and every side it omits keeps `MARGIN`, because
 * a chart that only wants its foot back should not have to restate the 60 px its
 * value labels need. A chart standing alone wants all four sides, but panes
 * stacked one above another do not: only the pane at the foot of the stack draws
 * a tick row, and only the topmost has anything above it to be kept clear of.
 * Three panes sharing a 400 px column each pay 48 px at the bottom and 16 px at
 * the top, which is 192 px of axis furniture where 64 px is all that can be seen
 * — the other 128 px is blank room taken out of the traces, and the middle pane
 * is left drawing in barely half of its third. Passing `{ top: 4, bottom: 4 }`
 * to every pane but the two that need the room hands it back.
 * @returns The plot inside the margins, clamped so it is never degenerate.
 */
export function plotRect(
  size: ChartSize,
  margin?: Partial<ChartMargin>,
): PlotRect {
  const top = margin?.top ?? MARGIN.top;
  const right = margin?.right ?? MARGIN.right;
  const bottom = margin?.bottom ?? MARGIN.bottom;
  const left = margin?.left ?? MARGIN.left;
  const width = Math.max(MINIMUM_PLOT_SIDE, size.width - left - right);
  const height = Math.max(MINIMUM_PLOT_SIDE, size.height - top - bottom);
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}
