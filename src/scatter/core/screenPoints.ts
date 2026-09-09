/**
 * Where every point sits on screen, as two parallel arrays.
 *
 * Parallel typed arrays rather than an array of objects: the hit tests are the
 * only code that reads them, they read them in index order, and an `{ x, y }`
 * per point would allocate one object per sample on every relayout.
 */
export interface ScreenPoints {
  /** Horizontal position of each point, in pixels from the plot's left. */
  x: Float64Array;
  /** Vertical position of each point, in pixels from the plot's top. */
  y: Float64Array;
}

/** The rectangle a set of coordinates spans, in pixels. */
export interface PixelBounds {
  /** Smallest horizontal position. */
  minX: number;
  /** Smallest vertical position. */
  minY: number;
  /** Largest horizontal position. */
  maxX: number;
  /** Largest vertical position. */
  maxY: number;
}

/**
 * The point nearest a position, when one is close enough to have been aimed at.
 *
 * Distances are compared squared. The caller only ever ranks them, so the
 * square root would be computed once per point on every pointer move and then
 * thrown away; a hover test over twenty thousand points is exactly where that
 * is not affordable.
 *
 * A tie goes to the lower index. Two points that land on the same pixel then
 * resolve the same way twice running, instead of the readout flickering
 * between them as the pointer jitters.
 * @param points - Where every point sits on screen.
 * @param x - Horizontal position to search from, in pixels from the plot's left.
 * @param y - Vertical position to search from, in pixels from the plot's top.
 * @param radius - How far from that position to look, in pixels; a point exactly that far away still counts.
 * @param included - One entry per point, a zero meaning the point cannot be hit. Every point can be hit when it is omitted, and a point past the end of a shorter mask cannot.
 * @returns The index of the nearest point within the radius, or `-1` when no point is within it.
 */
export function nearestPointIndex(
  points: ScreenPoints,
  x: number,
  y: number,
  radius: number,
  included?: Uint8Array,
): number {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius)) {
    return -1;
  }
  const xs = points.x;
  const ys = points.y;
  let count = Math.min(xs.length, ys.length);
  if (included !== undefined) count = Math.min(count, included.length);

  const limit = radius * radius;
  let nearest = -1;
  let nearestDistance = 0;
  for (let index = 0; index < count; index++) {
    if (included?.[index] === 0) continue;
    const pointX = xs[index];
    const pointY = ys[index];
    if (pointX === undefined || pointY === undefined) break;
    const deltaX = pointX - x;
    const deltaY = pointY - y;
    const distance = deltaX * deltaX + deltaY * deltaY;
    if (distance > limit) continue;
    if (nearest === -1 || distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  }
  return nearest;
}

/**
 * Which points fall inside a rectangle.
 *
 * A zoomed plot draws only part of its cloud, and the dots left outside the
 * frame are clipped rather than dropped: they are still in the coordinate
 * arrays, still one pixel away from the frame's edge, and still the nearest
 * point to a pointer resting just inside it. Without this mask a reader
 * zoomed in on one crowd gets hover cards about samples they cannot see.
 * @param points - Where every point sits on screen.
 * @param bounds - The rectangle, normally the plot's own; a point on an edge is inside it.
 * @param into - A mask to write into, so a resize does not allocate one per frame. It is used only when it already has one entry per point.
 * @returns One entry per point, `1` for inside.
 */
export function pointsWithinBounds(
  points: ScreenPoints,
  bounds: PixelBounds,
  into?: Uint8Array,
): Uint8Array {
  const xs = points.x;
  const ys = points.y;
  const count = Math.min(xs.length, ys.length);
  const mask = into?.length === count ? into.fill(0) : new Uint8Array(count);
  const { minX, minY, maxX, maxY } = bounds;
  for (let index = 0; index < count; index++) {
    const x = xs[index] ?? Number.NaN;
    const y = ys[index] ?? Number.NaN;
    if (x < minX || x > maxX || y < minY || y > maxY) continue;
    mask[index] = 1;
  }
  return mask;
}
