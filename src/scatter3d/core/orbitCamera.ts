/**
 * Where the reader is standing, and where a point in the cube lands on screen.
 *
 * The cloud is drawn with an orthographic projection rather than a perspective
 * one: a scatter is read by comparing distances, and perspective makes the same
 * distance shorter at the back of the box than at the front, so two groups
 * equally far apart would not look it. What is left to give the picture its
 * depth is the frame around it, the order the dots are painted in, and their
 * size — all of which cost nothing and none of which distorts a measurement.
 */

/** A point of the cube, `[x, y, z]`, with `z` running towards the reader. */
export type Vector3 = readonly [number, number, number];

/**
 * Where the reader is standing.
 *
 * The scene is turned by `pitch` about the horizontal axis and then by `yaw`
 * about the vertical one, which is the order a hand expects: dragging sideways
 * spins the box about its upright axis whatever it is already tilted to, and
 * dragging up and down tips it towards the reader.
 */
export interface OrbitCamera {
  /** Azimuth, in radians. A sideways drag changes it. */
  yaw: number;
  /** Elevation, in radians. A vertical drag changes it. */
  pitch: number;
}

/** Where a point of the cube landed, in pixels, and how near the reader it is. */
export interface ProjectedPoint {
  /** Pixels from the left of the drawing area. */
  x: number;
  /** Pixels from its top. */
  y: number;
  /**
   * Distance towards the reader, in cube units: larger is nearer. It orders
   * the painting and sizes the dots, and is never drawn as a number.
   */
  depth: number;
}

/**
 * The corner the box is first seen from.
 *
 * Slightly off both axes on purpose. Square-on, two of the three axes lie
 * exactly along the screen's own and the third collapses to a point, so the
 * first thing the reader sees is a flat scatter that hides a whole component —
 * a quarter turn and a slight tilt say "this is a box" before the pointer has
 * touched it.
 */
export const DEFAULT_ORBIT_CAMERA: OrbitCamera = { yaw: 0.6, pitch: 0.5 };

/**
 * How far the camera may tip, in radians.
 *
 * Just short of a right angle. Straight down the vertical axis the horizon
 * degenerates and a further drag flips the scene over, which reads as the plot
 * breaking rather than as the reader reaching the end of a range.
 */
export const ORBIT_PITCH_LIMIT = 1.4;

/** How many radians one pixel of drag turns the scene. */
export const ORBIT_RADIANS_PER_PIXEL = 0.01;

/**
 * Turn a point of the cube into the reader's own frame.
 * @param point - The point, in cube units.
 * @param camera - Where the reader is standing.
 * @returns The point in the reader's frame: right, up, and towards them.
 */
export function rotatePoint(point: Vector3, camera: OrbitCamera): Vector3 {
  const [x, y, z] = point;
  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  const upright = y * cosPitch - z * sinPitch;
  const tipped = y * sinPitch + z * cosPitch;
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);
  return [x * cosYaw + tipped * sinYaw, upright, -x * sinYaw + tipped * cosYaw];
}

/** Where the projection puts the middle of the cube, and how large it draws it. */
export interface OrbitViewport {
  /** Pixels per cube unit. */
  scale: number;
  /** Pixels from the left of the drawing area to the middle of the cube. */
  centerX: number;
  /** Pixels from its top to the middle of the cube. */
  centerY: number;
}

/**
 * Where a point of the cube lands on screen.
 *
 * The vertical axis is flipped, because a cube whose `y` grows upwards has to
 * be drawn on a screen whose pixels grow downwards.
 * @param point - The point, in cube units.
 * @param camera - Where the reader is standing.
 * @param viewport - Where the middle of the cube is, and how large it is drawn.
 * @returns See {@link ProjectedPoint}.
 */
export function projectPoint(
  point: Vector3,
  camera: OrbitCamera,
  viewport: OrbitViewport,
): ProjectedPoint {
  const [right, up, towards] = rotatePoint(point, camera);
  const { scale, centerX, centerY } = viewport;
  return {
    x: centerX + right * scale,
    y: centerY - up * scale,
    depth: towards,
  };
}

/**
 * The camera a drag leaves behind.
 *
 * The pitch is held inside its limit rather than allowed to wrap, so a reader
 * who keeps dragging upwards comes to rest looking down at the box instead of
 * watching it turn upside down.
 * @param camera - Where the reader was standing.
 * @param dx - How far the pointer moved across, in pixels.
 * @param dy - How far it moved down, in pixels.
 * @returns Where they are standing now.
 */
export function orbitByDrag(
  camera: OrbitCamera,
  dx: number,
  dy: number,
): OrbitCamera {
  const pitch = camera.pitch + dy * ORBIT_RADIANS_PER_PIXEL;
  return {
    yaw: camera.yaw + dx * ORBIT_RADIANS_PER_PIXEL,
    pitch: Math.min(ORBIT_PITCH_LIMIT, Math.max(-ORBIT_PITCH_LIMIT, pitch)),
  };
}

/**
 * The longest a cube diagonal can be, which is the range `depth` spans.
 *
 * A dot is sized from where it sits between the near and far corners, and this
 * is what that fraction is measured against — a constant rather than the
 * cloud's own extent, so a dot does not change size when a group is filtered
 * out from behind it.
 */
export const CUBE_HALF_DIAGONAL = Math.sqrt(3);

/**
 * Where a point sits between the far corner of the cube and the near one.
 * @param depth - How far towards the reader the point is, in cube units.
 * @returns From 0 at the back to 1 at the front.
 */
export function depthFraction(depth: number): number {
  if (!Number.isFinite(depth)) return depth > 0 ? 1 : 0;
  const fraction = (depth / CUBE_HALF_DIAGONAL + 1) / 2;
  return Math.min(1, Math.max(0, fraction));
}
