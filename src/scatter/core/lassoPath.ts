const DEFAULT_CAPACITY = 256;

/**
 * The outline a pointer has drawn, as a buffer that is only partly in use.
 *
 * The two arrays are grown by doubling and never shrunk, and `length` says how
 * much of them is the path. A drag emits a pointer move every frame or more
 * often; growing the buffer on each one would put a fresh pair of typed arrays
 * in front of the collector sixty times a second, during the one interaction
 * where a dropped frame is visible as a kink in the line the user is drawing.
 */
export interface LassoPath {
  /** Horizontal position of each vertex; only the first `length` are in use. */
  xs: Float64Array;
  /** Vertical position of each vertex; only the first `length` are in use. */
  ys: Float64Array;
  /** How many vertices have been kept. */
  length: number;
}

/**
 * An empty path, with room to grow.
 * @param capacity - How many vertices to make room for before the first growth; at least one, and rounded down. Defaults to 256, which is a couple of seconds of dragging.
 * @returns The path, holding no vertex yet.
 */
export function createLassoPath(capacity = DEFAULT_CAPACITY): LassoPath {
  const size = Number.isFinite(capacity)
    ? Math.max(1, Math.floor(capacity))
    : DEFAULT_CAPACITY;
  return { xs: new Float64Array(size), ys: new Float64Array(size), length: 0 };
}

/**
 * Empty a path without giving up the room it has claimed.
 *
 * The buffers are kept, so the second lasso of a session and the fiftieth cost
 * nothing to start. Whatever is left past `length` is never read.
 * @param path - The path to empty.
 */
export function resetLassoPath(path: LassoPath): void {
  path.length = 0;
}

/**
 * Add a vertex, unless it is too near the last one kept.
 *
 * The distance is measured from the last vertex that was kept, not from the
 * last position the pointer reported, so consecutive vertices are always at
 * least `minDistance` apart however slowly the pointer is moving. Measuring
 * from the raw sample instead would let a slow drag across the whole plot keep
 * a single vertex, and the outline would close as a straight line between
 * where the drag started and where it ended.
 * @param path - The path to add to; its buffers are doubled when full.
 * @param x - Horizontal position of the vertex, in pixels.
 * @param y - Vertical position of the vertex, in pixels.
 * @param minDistance - How far the pointer has to have moved for the vertex to be worth keeping, in pixels. Nothing is dropped when it is zero, negative, or not finite.
 * @returns Whether the vertex was kept. A position that is not finite never is.
 */
export function appendLassoPoint(
  path: LassoPath,
  x: number,
  y: number,
  minDistance: number,
): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

  if (path.length > 0) {
    const lastX = path.xs[path.length - 1];
    const lastY = path.ys[path.length - 1];
    if (lastX !== undefined && lastY !== undefined) {
      const gate =
        Number.isFinite(minDistance) && minDistance > 0
          ? minDistance * minDistance
          : 0;
      const deltaX = x - lastX;
      const deltaY = y - lastY;
      if (deltaX * deltaX + deltaY * deltaY < gate) return false;
    }
  }

  if (path.length >= path.xs.length || path.length >= path.ys.length) {
    growLassoPath(path);
  }
  path.xs[path.length] = x;
  path.ys[path.length] = y;
  path.length += 1;
  return true;
}

/**
 * The path as an SVG `d` attribute.
 *
 * Coordinates are rounded to a tenth of a pixel. A lasso is drawn at a
 * resolution the eye cannot resolve past that, and the full doubles would put
 * seventeen characters per vertex into an attribute that is rewritten on every
 * frame of the drag.
 * @param path - The path to write out.
 * @param close - Whether to close the ring with a `Z`, which is what turns the drawn line into the shape that is about to be tested.
 * @returns The `d` attribute, or an empty string when the path holds no vertex.
 */
export function lassoPathData(path: LassoPath, close: boolean): string {
  const count = Math.min(path.length, path.xs.length, path.ys.length);
  let data = '';
  for (let index = 0; index < count; index++) {
    const x = path.xs[index];
    const y = path.ys[index];
    if (x === undefined || y === undefined) break;
    data += `${index === 0 ? 'M' : ' L'}${roundToTenth(x)},${roundToTenth(y)}`;
  }
  if (data.length === 0) return '';
  return close ? `${data}Z` : data;
}

function growLassoPath(path: LassoPath): void {
  const capacity = Math.max(1, Math.min(path.xs.length, path.ys.length)) * 2;
  const xs = new Float64Array(capacity);
  const ys = new Float64Array(capacity);
  xs.set(path.xs);
  ys.set(path.ys);
  path.xs = xs;
  path.ys = ys;
}

function roundToTenth(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}
