import type { PixelBounds, ScreenPoints } from './screenPoints.ts';

/**
 * Whether a point falls inside a polygon.
 *
 * A ray cast from the point towards growing x, counting the edges it crosses:
 * an odd count is inside, an even one is outside. Both tests that decide a
 * crossing are half-open, and that is what settles the boundary. An edge is
 * only considered for the ys it spans from its lower end up to, but not
 * including, its upper end; and the crossing has to sit strictly beyond the
 * point. So on the square `(0,0) (10,0) (10,10) (0,10)` the two edges meeting
 * at `(0,0)` count as inside — `(5,0)` and `(0,5)` are in — while the two
 * meeting at `(10,10)` count as outside, and `(5,10)` and `(10,5)` are out. Of
 * the four corners only `(0,0)` is inside; `(10,0)`, `(0,10)` and `(10,10)`
 * are not.
 *
 * The asymmetry is the point of the convention rather than an accident of it:
 * it is what stops two polygons sharing an edge from both claiming the samples
 * that lie along it, and what keeps a point from toggling in and out as a
 * lasso is dragged a hundredth of a pixel.
 * @param x - Horizontal position of the point, in pixels.
 * @param y - Vertical position of the point, in pixels.
 * @param xs - Horizontal position of each vertex, in order around the ring; the ring is closed for you.
 * @param ys - Vertical position of each vertex, in the same order.
 * @param vertexCount - How many leading entries of the two arrays are vertices, so that a growing buffer can be passed whole. Their common length when omitted.
 * @returns Whether the point is inside; always `false` for fewer than three vertices, since nothing thinner than a triangle holds anything.
 */
export function pointInPolygon(
  x: number,
  y: number,
  xs: Float64Array,
  ys: Float64Array,
  vertexCount?: number,
): boolean {
  const count = usableVertexCount(xs, ys, vertexCount);
  if (count < 3) return false;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

  let previousX = xs[count - 1];
  let previousY = ys[count - 1];
  if (previousX === undefined || previousY === undefined) return false;

  let inside = false;
  for (let index = 0; index < count; index++) {
    const currentX = xs[index];
    const currentY = ys[index];
    if (currentX === undefined || currentY === undefined) break;
    if (currentY > y !== previousY > y) {
      const crossing =
        ((previousX - currentX) * (y - currentY)) / (previousY - currentY) +
        currentX;
      if (x < crossing) inside = !inside;
    }
    previousX = currentX;
    previousY = currentY;
  }
  return inside;
}

/**
 * The rectangle a polygon's vertices span.
 * @param xs - Horizontal position of each vertex.
 * @param ys - Vertical position of each vertex.
 * @param vertexCount - How many leading entries are vertices. Their common length when omitted.
 * @returns The rectangle, or `null` when no vertex has two finite coordinates. Vertices that do not are left out rather than poisoning the bounds with a `NaN`.
 */
export function polygonBounds(
  xs: Float64Array,
  ys: Float64Array,
  vertexCount?: number,
): PixelBounds | null {
  const count = usableVertexCount(xs, ys, vertexCount);
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let bounded = false;
  for (let index = 0; index < count; index++) {
    const vertexX = xs[index];
    const vertexY = ys[index];
    if (vertexX === undefined || vertexY === undefined) break;
    if (!Number.isFinite(vertexX) || !Number.isFinite(vertexY)) continue;
    if (vertexX < minX) minX = vertexX;
    if (vertexX > maxX) maxX = vertexX;
    if (vertexY < minY) minY = vertexY;
    if (vertexY > maxY) maxY = vertexY;
    bounded = true;
  }
  return bounded ? { minX, minY, maxX, maxY } : null;
}

/**
 * Which of many points fall inside a polygon.
 *
 * Each point is measured against the polygon's rectangle first, which is four
 * comparisons and rejects nearly every point of a cloud that a lasso has
 * enclosed a corner of; only the survivors pay for a walk over every edge. The
 * saving is the whole reason the prefilter is here: a released lasso has a
 * vertex for every few pixels the pointer travelled, so the unfiltered cost is
 * the point count times a few hundred, per drag, on the frame the user is
 * waiting for.
 *
 * Nothing is allocated per point. The rectangle is computed once, the answer
 * is written into the mask, and the mask itself is reused when the caller
 * hands one of the right size back.
 * @param points - Where every point sits on screen.
 * @param xs - Horizontal position of each vertex.
 * @param ys - Vertical position of each vertex.
 * @param vertexCount - How many leading entries are vertices. Their common length when omitted.
 * @param into - A mask to write into, so a drag does not allocate one per frame. It is used only when it already has one entry per point; otherwise a new one is allocated, because silently answering about a different number of points is worse than the allocation.
 * @returns One entry per point, `1` for inside and `0` for outside. All zeros for fewer than three vertices.
 */
export function pointsInPolygon(
  points: ScreenPoints,
  xs: Float64Array,
  ys: Float64Array,
  vertexCount?: number,
  into?: Uint8Array,
): Uint8Array {
  const pointsX = points.x;
  const pointsY = points.y;
  const total = Math.min(pointsX.length, pointsY.length);
  const mask = into?.length === total ? into : new Uint8Array(total);

  const count = usableVertexCount(xs, ys, vertexCount);
  const bounds = count < 3 ? null : polygonBounds(xs, ys, count);
  if (bounds === null) {
    mask.fill(0);
    return mask;
  }

  const { minX, minY, maxX, maxY } = bounds;
  for (let index = 0; index < total; index++) {
    const pointX = pointsX[index];
    const pointY = pointsY[index];
    if (pointX === undefined || pointY === undefined) break;
    if (pointX < minX || pointX > maxX || pointY < minY || pointY > maxY) {
      mask[index] = 0;
      continue;
    }
    mask[index] = pointInPolygon(pointX, pointY, xs, ys, count) ? 1 : 0;
  }
  return mask;
}

function usableVertexCount(
  xs: Float64Array,
  ys: Float64Array,
  vertexCount: number | undefined,
): number {
  const available = Math.min(xs.length, ys.length);
  if (vertexCount === undefined) return available;
  if (!Number.isFinite(vertexCount)) return 0;
  return Math.max(0, Math.min(available, Math.floor(vertexCount)));
}
