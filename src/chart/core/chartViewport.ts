/**
 * The frame a chart is zoomed into, and the arithmetic that moves it.
 *
 * A zoom here is a domain and never a transform: the frame hands the two axes
 * a narrower range and everything downstream — the ticks, the outlines, the
 * hit tests, the labels — is computed from it exactly as it is computed
 * unzoomed. Nothing has to be told a zoom happened, which is the whole reason
 * it is done this way, and it is why all of it is arithmetic that can be
 * checked without rendering anything.
 */

/** The range each axis of a chart covers, when it is not covering all of it. */
export interface ChartViewport {
  /** What the horizontal axis covers, ascending. */
  readonly x: readonly [number, number];
  /** What the vertical axis covers. */
  readonly y: readonly [number, number];
}

/**
 * The smallest share of an axis's full range a viewport may cover, which caps
 * how far in the reader can go. Five hundred times is past the point where the
 * dots left on screen still stand for anything.
 */
export const CHART_SMALLEST_ZOOM = 0.002;

/** How much one pixel of wheel travel zooms by, as a share. */
export const CHART_WHEEL_SPEED = 0.0015;

/** Pixels a wheel notch is worth where the browser reports lines. */
export const CHART_WHEEL_LINE = 16;

/** Pixels it is worth where the browser reports pages. */
export const CHART_WHEEL_PAGE = 400;

/**
 * The most travel one wheel event is read as, in pixels.
 *
 * A trackpad flick arrives as a handful of events carrying several hundred
 * pixels each, and an inertial one keeps arriving after the fingers have left
 * the glass. Uncapped, a single flick takes an axis through several orders of
 * magnitude and the data is gone; capped, the gesture stays fast and is always
 * recoverable by flicking the other way.
 *
 * The cap is written in travel rather than as a largest factor because travel
 * is what the browser reports and what varies between them — so a chart that
 * zooms at its own pace is held to the same burst as every other.
 */
export const CHART_WHEEL_TRAVEL = 240;

/**
 * The viewport a zoom about one point leaves behind.
 *
 * The point under the anchor stays where it is, which is what makes the
 * gesture read as pulling the picture rather than nudging a slider: the reader
 * aims at the crowd they want and it grows around the pointer.
 * @param full - What the axes cover unzoomed, which the result never leaves.
 * @param current - The viewport now, or `null` when the chart is showing all of it.
 * @param anchorX - The horizontal value to hold still, in data units.
 * @param anchorY - The vertical one.
 * @param factor - How much wider the frame becomes; below one it narrows.
 * @returns The new viewport, or `null` once it covers everything again — so a
 * reader who zooms back out gets the unzoomed chart back rather than a frame
 * that merely looks like it.
 */
export function chartZoomViewport(
  full: ChartViewport,
  current: ChartViewport | null,
  anchorX: number,
  anchorY: number,
  factor: number,
): ChartViewport | null {
  const scale = Number.isFinite(factor) && factor > 0 ? factor : 1;
  const x = chartZoomDomain(full.x, current?.x ?? full.x, anchorX, scale);
  const y = chartZoomDomain(full.y, current?.y ?? full.y, anchorY, scale);
  if (sameDomain(x, full.x) && sameDomain(y, full.y)) return null;
  return { x, y };
}

/**
 * A frame the reader asked for, made to fit: never narrower than the zoom cap,
 * never reaching outside the data, and never wider than the whole of it.
 *
 * It is what "zoom to selection" goes through, so a lasso around one sample
 * lands at the same depth as a wheel held down over it rather than at the
 * bottom of a well.
 * @param full - What the axes cover unzoomed.
 * @param wanted - The frame asked for.
 * @returns The frame that will be drawn, or `null` when it covers everything.
 */
export function chartClampViewport(
  full: ChartViewport,
  wanted: ChartViewport,
): ChartViewport | null {
  return chartZoomViewport(
    full,
    wanted,
    middleOf(wanted.x),
    middleOf(wanted.y),
    1,
  );
}

/**
 * One axis zoomed about one value, clamped to its full range.
 *
 * A frame that would reach past an end is slid back inside rather than
 * squashed, so the reader keeps the magnification they asked for and the cloud
 * cannot be pushed off the edge and lost.
 * @param full - What the axis covers unzoomed.
 * @param current - What it covers now.
 * @param anchor - The value to hold still, in data units.
 * @param factor - How much wider the range becomes.
 * @returns The new range, ascending, or `full` when the zoom has reached back out to it.
 */
export function chartZoomDomain(
  full: readonly [number, number],
  current: readonly [number, number],
  anchor: number,
  factor: number,
): readonly [number, number] {
  const bounds = ascending(full);
  const reach = bounds[1] - bounds[0];
  if (!(reach > 0) || !Number.isFinite(reach)) return full;

  const shown = ascending(current);
  const span = fittedSpan((shown[1] - shown[0]) * factor, reach);
  if (span === reach) return full;

  const share = anchorShare(anchor, shown);
  const wanted = Number.isFinite(anchor) ? anchor - share * span : shown[0];
  const start = Math.min(
    Math.max(wanted, bounds[0]),
    Math.max(bounds[1] - span, bounds[0]),
  );
  return [start, start + span];
}

/**
 * How much a wheel event zooms by.
 *
 * The travel is normalised first, because the same notch of the same wheel
 * arrives as pixels in one browser and as lines in another, and a zoom that
 * moves three times as fast in Firefox is a fault the reader blames on the
 * figure. Then it is capped at {@link CHART_WHEEL_TRAVEL}, so one burst can
 * only ever be worth one flick.
 *
 * The factor is `exp(pixels x rate)`, so the gesture is multiplicative: two
 * notches in and two notches out land back where they started, whichever way
 * round they were made, and a zoom deep into one small feature comes back out
 * at the pace it went in.
 * @param delta - The event's `deltaY`; positive scrolls away and zooms out.
 * @param mode - Its `deltaMode`: 0 pixels, 1 lines, 2 pages. Defaults to `0`.
 * @param speed - Share zoomed per pixel of travel. Defaults to {@link CHART_WHEEL_SPEED}.
 * @returns The factor to hand {@link chartZoomViewport}; `1` for an event that says nothing.
 */
export function chartWheelFactor(
  delta: number,
  mode = 0,
  speed = CHART_WHEEL_SPEED,
): number {
  const travel = chartWheelTravel(delta, mode);
  if (travel === 0) return 1;
  const rate = Number.isFinite(speed) && speed > 0 ? speed : CHART_WHEEL_SPEED;
  return Math.exp(travel * rate);
}

/**
 * The travel one wheel event carries, in pixels, capped.
 *
 * Separate from the factor because a gesture that is not a zoom — a wheel that
 * scales a value axis about its baseline — needs the same normalisation and
 * the same cap while computing something else entirely.
 * @param delta - The event's `deltaY`.
 * @param mode - Its `deltaMode`: 0 pixels, 1 lines, 2 pages. Defaults to `0`.
 * @returns The travel, `0` for an event that says nothing.
 */
export function chartWheelTravel(delta: number, mode = 0): number {
  if (!Number.isFinite(delta) || delta === 0) return 0;
  const pixels = delta * wheelPixels(mode);
  return Math.min(CHART_WHEEL_TRAVEL, Math.max(-CHART_WHEEL_TRAVEL, pixels));
}

function wheelPixels(mode: number): number {
  if (mode === 1) return CHART_WHEEL_LINE;
  if (mode === 2) return CHART_WHEEL_PAGE;
  return 1;
}

/**
 * The span a frame ends up with: at least the zoom cap, at most the whole
 * range.
 * @param span - The span asked for.
 * @param reach - The full range's span.
 * @returns The span to draw. A span of nothing is drawn at the cap, since
 * framing one sample means going as far in as the chart goes rather than
 * giving up and showing everything; one that is not a number does show
 * everything, because nothing better can be said about it.
 */
function fittedSpan(span: number, reach: number): number {
  const smallest = reach * CHART_SMALLEST_ZOOM;
  if (!Number.isFinite(span)) return reach;
  if (span <= 0) return smallest;
  if (span >= reach) return reach;
  return Math.max(span, smallest);
}

/**
 * Where the anchor sits across the frame it is anchoring, from 0 to 1.
 * @param anchor - The value held still.
 * @param shown - The frame it sits in, ascending.
 * @returns The share; the middle of a frame with no width, which is the only
 * place an anchor can be said to sit on one.
 */
function anchorShare(anchor: number, shown: readonly [number, number]): number {
  const span = shown[1] - shown[0];
  if (!(span > 0) || !Number.isFinite(span)) return 0.5;
  const share = (anchor - shown[0]) / span;
  if (!Number.isFinite(share)) return 0.5;
  return Math.min(1, Math.max(0, share));
}

function middleOf(domain: readonly [number, number]): number {
  return (domain[0] + domain[1]) / 2;
}

function sameDomain(
  one: readonly [number, number],
  other: readonly [number, number],
): boolean {
  return one[0] === other[0] && one[1] === other[1];
}

function ascending(
  domain: readonly [number, number],
): readonly [number, number] {
  return domain[0] <= domain[1] ? domain : [domain[1], domain[0]];
}
