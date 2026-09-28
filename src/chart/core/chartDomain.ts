/**
 * The window a chart is showing, which is the one thing every viewer built on
 * this package holds in common.
 *
 * Two numbers on each axis and nothing else — no units, no labels, no notion of
 * what is being measured. That absence is the point: a mass spectrum reads its
 * x axis as m/z and an infrared spectrum reads the same two numbers as
 * wavenumbers, so a window that named either would need converting at every
 * boundary, and a zoom gesture would have to be written twice to do the same
 * arithmetic.
 *
 * The y axis is called nothing more specific than y for the same reason. It
 * carries intensity in one viewer, absorbance or percent transmittance in
 * another, and the arithmetic that maps it to pixels cares only that it is a
 * range of numbers.
 */

/** The window a chart is showing, in data units. */
export interface ChartDomain {
  /** `[min, max]` on the horizontal axis. */
  x: [number, number];
  /** `[min, max]` on the vertical axis, the lower bound negative in mirror mode. */
  y: [number, number];
}

/**
 * How the vertical axis behaves under a gesture, where the two viewers differ.
 *
 * A mass spectrum is drawn as sticks standing on zero, so zero has to stay in
 * the window however it is zoomed — a window starting at a tenth of the base
 * peak cuts every stick off at the ankles. A continuous trace has no feet: an
 * infrared band dragged out at 20 to 60 percent transmittance is asked about at
 * 20 to 60 percent, and forcing 100 into the window would undo the zoom that was
 * just asked for.
 *
 * The baseline is also what the wheel scales about, which is not always zero:
 * percent transmittance runs *down* from 100, and scaling it about zero would
 * walk the whole trace off the top of the plot instead of stretching it.
 */
export interface YAxisRules {
  /**
   * The value the wheel scales about, and the line a drag is judged against.
   * @default 0
   */
  baseline?: number;
  /**
   * Whether the baseline must stay inside the window a drag asks for — true for
   * a stick spectrum standing on it, false for a continuous trace.
   * @default true
   */
  keepBaseline?: boolean;
  /**
   * Whether the features hang **down** from the baseline rather than standing up
   * out of it.
   *
   * This is which side of the baseline the data is on, and it decides which way
   * "released past the baseline" points. A mass peak and an absorbance band both
   * stand up out of a baseline at the foot of the plot, so the gesture is a drag
   * released *below* it. Percent transmittance hangs down from 100, which sits
   * near the *top* — so there the gesture is a drag released above it, and asking
   * the mass question instead would make almost every drag in the plot take the
   * value axis with it.
   * @default false
   */
  pointsDown?: boolean;
}

/** What the rules come to when a viewer states none of them. */
export const DEFAULT_Y_AXIS_RULES: Required<YAxisRules> = {
  baseline: 0,
  keepBaseline: true,
  pointsDown: false,
};

/**
 * What a drag across the plot zooms to.
 *
 * `xAxis` is the reading gesture and the default: the question a chemist asks of
 * a spectrum is nearly always "what is between 1650 and 1750", never "what is
 * between forty and sixty percent", so a drag narrows the horizontal axis and
 * leaves the height alone unless it is released past the baseline.
 *
 * `box` is the tool: while it is chosen, the rectangle dragged out is the window,
 * both axes at once. It is a mode rather than a modifier because it is used in
 * runs — a baseline being examined is examined several times over — and a
 * modifier held down through each of them is a worse gesture than a tool pressed
 * once.
 *
 * The two are named apart from the whole of `DragMode` so that a chart offering
 * nothing but zoom tools can say so in its own signature — which is what stops
 * `select`, the one drag that moves no axis, from reaching a chart with no
 * handler for it.
 */
export type ZoomDragMode = 'xAxis' | 'box';

/**
 * What a drag across the plot asks for.
 *
 * `select` is the third and it is not a zoom at all: the rectangle swept out is
 * handed back as a range and the window is left exactly where it was. A
 * chromatographic peak is integrated between two retention times a chemist
 * chose, and choosing them by dragging over them is the gesture — so the answer
 * to it is two numbers on the horizontal axis rather than a new window, and a
 * chart that zoomed to them as well would take the neighbouring peaks off the
 * screen the moment the boundaries were set.
 *
 * It is a mode rather than a modifier for the reason `ZoomDragMode` already
 * gives — integration is done in runs — and it is kept out of `ZoomDragMode` so
 * that a chart offering only zoom tools, which is what the infrared toolbar
 * hands to its `zoomGestures`, cannot be handed it by a widening nobody noticed.
 * Handed one, that chart would sweep out a rectangle and then do nothing at all.
 */
export type DragMode = ZoomDragMode | 'select';

/** How the y axis behaves, and what a drag is taken to mean. */
export interface ZoomRules extends YAxisRules {
  /**
   * What a drag asks for.
   * @default 'xAxis'
   */
  drag?: DragMode;
}

/**
 * Which gestures a chart answers, for a viewer that offers fewer than all of
 * them.
 *
 * A gesture is worth having only where the axis it moves has somewhere to go,
 * and that is a property of what is being measured rather than of the chart. An
 * axis running between two ends the data fills — percent transmittance from 0 to
 * 100 — has nothing for the wheel to scale: stretching it about its baseline
 * pushes the trace off the plot and leaves an axis that no longer reads as
 * percent. An axis open at one end — intensity, absorbance — has weak features
 * lying against the baseline, and bringing those up is what the wheel is for.
 *
 * Saying it here, once, is what keeps a viewer from answering a gesture in one
 * mode and quietly ignoring it in another: the whole set travels as one object
 * from whatever knows the measurement into `useChartZoom`.
 */
export interface ZoomGestures {
  /**
   * What a drag across the plot asks for.
   * @default 'xAxis'
   */
  drag?: DragMode;
  /**
   * Whether the wheel scales the value axis about its baseline.
   *
   * Turned off, the wheel is left entirely alone — the page scrolls under the
   * pointer as it does anywhere else, which is what a reader expects of a chart
   * that does not answer the gesture.
   * @default true
   */
  wheel?: boolean;
}

/** What the gestures come to when a viewer states none of them. */
export const DEFAULT_ZOOM_GESTURES: Required<ZoomGestures> = {
  drag: 'xAxis',
  wheel: true,
};

/**
 * Whether two windows show the same thing, compared by their four numbers.
 *
 * By value and never by identity, because the fitted window is rebuilt from the
 * spectra whenever anything about them changes — a colour, a name, a visibility
 * — and only some of those changes move an axis. A chart that told the two
 * apart by identity would throw the user's zoom away every time they touched
 * the list beside it.
 * @param current - The window in force.
 * @param next - The window just worked out.
 * @returns Whether both axes already run between the same bounds.
 */
export function sameChartDomain(
  current: ChartDomain,
  next: ChartDomain,
): boolean {
  return (
    current.x[0] === next.x[0] &&
    current.x[1] === next.x[1] &&
    current.y[0] === next.y[0] &&
    current.y[1] === next.y[1]
  );
}
