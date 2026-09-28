/**
 * Turning a pointer on the screen into a point on the chart.
 *
 * Asked by everything that reads a gesture — the crosshair, the box zoom, the
 * click that pins a label — so it is answered once, here, and all of them place
 * the pointer in the same place.
 *
 * The SVG's own screen matrix is the only correct answer once the chart carries
 * a `viewBox`: the element then draws in user units of its own, and a pointer
 * 300 CSS pixels from the left edge of an 800-pixel-wide chart showing 600 user
 * units is at 225 of them, not at 300. The matrix carries that scaling, the
 * device pixel ratio and any transform an ancestor applies, all at once, so
 * nothing downstream has to know that any of them happened.
 */

/** A point on the chart, in the user units its `viewBox` is written in. */
export interface ChartPoint {
  /** Distance from the left edge of the SVG. */
  x: number;
  /** Distance from its top edge. */
  y: number;
}

/** The little of an SVG matrix a pointer position is worked out from. */
export interface ScreenMatrix {
  /** Horizontal scaling. */
  a: number;
  /** Vertical shear. */
  b: number;
  /** Horizontal shear. */
  c: number;
  /** Vertical scaling. */
  d: number;
  /** Horizontal translation. */
  e: number;
  /** Vertical translation. */
  f: number;
  /** The matrix that undoes this one. */
  inverse: () => ScreenMatrix;
}

/** The little of an SVG element a pointer position is asked of. */
export interface PointerSurface {
  /** How the SVG's user units are laid over the screen. */
  getScreenCTM: () => ScreenMatrix | null;
}

/**
 * Where a pointer is, in the user units the SVG draws in.
 *
 * The matrix maps user units onto the screen, so it is inverted to go the other
 * way. It is applied here rather than through a `DOMPoint` so that the
 * arithmetic can be read — and tested — without a browser standing by.
 *
 * A surface that is not laid out has no matrix to give: an SVG inside a folded
 * panel, or one whose `viewBox` has collapsed to nothing, answers `null` rather
 * than a matrix of zeros, and the caller is then told there is no position
 * instead of being handed an infinity that lands every gesture at the same
 * impossible place.
 * @param surface - The SVG, `null` before it is on screen.
 * @param clientX - Where the pointer is on the screen, horizontally.
 * @param clientY - Where it is vertically.
 * @returns The point, `null` when the surface cannot place it.
 */
export function svgPointAt(
  surface: PointerSurface | null,
  clientX: number,
  clientY: number,
): ChartPoint | null {
  const screen = surface?.getScreenCTM();
  if (!screen) return null;
  const inverse = screen.inverse();
  const x = clientX * inverse.a + clientY * inverse.c + inverse.e;
  const y = clientX * inverse.b + clientY * inverse.d + inverse.f;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}
