/**
 * Where the cube, the cloud and the shells land on screen for one camera.
 *
 * Everything a cloud draws is fitted once, in cube units, and re-projected on
 * every turn — so an orbit costs one rotation per sample and one silhouette
 * per shell, and nothing is fitted again while the box is turning.
 */

import { chartRoundPixel } from '../../chart/core/chartScale.ts';
import type { ScreenPoints } from '../../scatter/core/screenPoints.ts';
import type { ConfidenceEllipsoid } from '../core/confidenceEllipsoid.ts';
import { ellipsoidSilhouette } from '../core/ellipsoidSilhouette.ts';
import type {
  OrbitCamera,
  OrbitViewport,
  Vector3,
} from '../core/orbitCamera.ts';
import { depthFraction, projectPoint } from '../core/orbitCamera.ts';

/** Room kept between the figure's edge and the cube, in pixels. */
export const CLOUD_MARGIN = 16;

/**
 * How much of the shorter side the cube spans before the reader zooms.
 *
 * Well short of the whole: the cube is drawn turned, so its silhouette is a
 * hexagon as wide as its body diagonal, and a cube sized to the box edge-on
 * would push two of its corners past the frame the moment it was turned.
 */
export const CLOUD_FILL = 0.62;

/** The rectangle the cloud is drawn in, and how the cube maps into it. */
export interface CloudView {
  /** The drawing area, ready to spread onto a `<rect>`. */
  rect: { x: number; y: number; width: number; height: number };
  /** Where the middle of the cube sits, and how large it is drawn. */
  viewport: OrbitViewport;
}

/**
 * The drawing area and the cube's place in it.
 * @param width - Total width of the figure, in pixels.
 * @param height - Total height.
 * @param zoom - What the reader has zoomed to; `1` is the resting size.
 * @returns See {@link CloudView}.
 */
export function cloudView(
  width: number,
  height: number,
  zoom: number,
): CloudView {
  const inner = Math.max(0, width - CLOUD_MARGIN * 2);
  const tall = Math.max(0, height - CLOUD_MARGIN * 2);
  const factor = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  return {
    rect: { x: CLOUD_MARGIN, y: CLOUD_MARGIN, width: inner, height: tall },
    viewport: {
      scale: (Math.min(inner, tall) / 2) * CLOUD_FILL * factor,
      centerX: CLOUD_MARGIN + inner / 2,
      centerY: CLOUD_MARGIN + tall / 2,
    },
  };
}

/** Where every sample landed, and in what order they are painted. */
export interface CloudCloud {
  /** The positions, in the same space a gesture arrives in. */
  points: ScreenPoints;
  /** How far towards the reader each one is, in cube units. */
  depths: Float64Array;
  /** The rows, furthest first, which is the order they are drawn in. */
  order: Uint32Array;
}

/**
 * Every sample, projected and ordered back to front.
 *
 * The order is what makes the cloud read as a solid: a dot at the front drawn
 * over a dot at the back says which is which, where the same two dots in row
 * order say nothing at all. It is a separate array rather than a sorted copy
 * of the points because the hit test, the labels and the selection all index
 * by row and must not be reordered with the painting.
 * @param cube - Every sample, in cube units.
 * @param camera - Where the reader is standing.
 * @param viewport - Where the middle of the cube is, and how large it is drawn.
 * @returns See {@link CloudCloud}.
 */
export function projectCloud(
  cube: readonly Vector3[],
  camera: OrbitCamera,
  viewport: OrbitViewport,
): CloudCloud {
  const count = cube.length;
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  const depths = new Float64Array(count);
  for (let index = 0; index < count; index++) {
    const at = projectPoint(cube[index] as Vector3, camera, viewport);
    x[index] = at.x;
    y[index] = at.y;
    depths[index] = at.depth;
  }

  const rows = new Uint32Array(count);
  for (let index = 0; index < count; index++) rows[index] = index;
  const order = rows.toSorted(
    (a, b) => (depths[a] as number) - (depths[b] as number),
  );

  return { points: { x, y }, depths, order };
}

/**
 * How large each dot is drawn, from how near the front of the box it sits.
 *
 * A fifth larger at the front than at the back: enough that the eye reads it
 * as depth when it is looking for depth, and little enough that nobody takes
 * it for a value — a dot size that carried a measurement would be a fourth
 * dimension nothing labelled. It is read from the projection rather than from
 * the data, so a turn changes it and a filter does not.
 * @param depths - How far towards the reader each sample is, in cube units.
 * @param radius - Radius of a dot at the middle of the box, in pixels.
 * @returns One radius per sample, in pixels.
 */
export function cloudPointRadii(
  depths: Float64Array,
  radius: number,
): Float64Array {
  const radii = new Float64Array(depths.length);
  for (let index = 0; index < depths.length; index++) {
    const fraction = depthFraction(depths[index] as number);
    radii[index] = radius * (NEAREST_SHRINK + DEPTH_RANGE * fraction);
  }
  return radii;
}

/** How much smaller than `radius` the dot at the very back is drawn. */
const NEAREST_SHRINK = 0.9;

/** How much the radius grows from the back of the box to its front. */
const DEPTH_RANGE = 0.4;

/** One shell's outline, ready to be filled. */
export interface CloudOutline {
  /** Where its middle landed, in pixels from the left. */
  cx: number;
  /** And from the top. */
  cy: number;
  /** Half its longest width, in pixels. */
  rx: number;
  /** Half its width across that, in pixels. */
  ry: number;
  /** How far the long axis is turned from the horizontal, in degrees. */
  angle: number;
  /** How far towards the reader its middle is, in cube units. */
  depth: number;
}

/**
 * Where one shell's outline lands on screen.
 * @param ellipsoid - The shell, in cube units.
 * @param camera - Where the reader is standing.
 * @param viewport - Where the middle of the cube is, and how large it is drawn.
 * @returns See {@link CloudOutline}, or `null` when the camera sends the shell nowhere a browser can draw.
 */
export function projectShellOutline(
  ellipsoid: ConfidenceEllipsoid,
  camera: OrbitCamera,
  viewport: OrbitViewport,
): CloudOutline | null {
  const at = projectPoint(ellipsoid.center, camera, viewport);
  const { rx, ry, angle } = ellipsoidSilhouette(ellipsoid, camera);
  const outline = {
    cx: chartRoundPixel(at.x),
    cy: chartRoundPixel(at.y),
    rx: chartRoundPixel(rx * viewport.scale),
    ry: chartRoundPixel(ry * viewport.scale),
    angle: chartRoundPixel((angle * 180) / Math.PI),
    depth: at.depth,
  };
  for (const value of [outline.cx, outline.cy, outline.rx, outline.ry]) {
    if (!Number.isFinite(value)) return null;
  }
  return outline;
}

/** A segment of the frame, in pixels. */
export interface CloudSegment {
  /** Where it starts. */
  x1: number;
  /** Where it starts. */
  y1: number;
  /** Where it ends. */
  x2: number;
  /** Where it ends. */
  y2: number;
}

/**
 * A run of cube-space segments, projected.
 * @param segments - The segments, as pairs of corners in cube units.
 * @param camera - Where the reader is standing.
 * @param viewport - Where the middle of the cube is, and how large it is drawn.
 * @returns The segments, in pixels, in the order they were given.
 */
export function projectSegments(
  segments: ReadonlyArray<readonly [Vector3, Vector3]>,
  camera: OrbitCamera,
  viewport: OrbitViewport,
): CloudSegment[] {
  const lines: CloudSegment[] = [];
  for (const [from, to] of segments) {
    const start = projectPoint(from, camera, viewport);
    const end = projectPoint(to, camera, viewport);
    lines.push({
      x1: chartRoundPixel(start.x),
      y1: chartRoundPixel(start.y),
      x2: chartRoundPixel(end.x),
      y2: chartRoundPixel(end.y),
    });
  }
  return lines;
}
