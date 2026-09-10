/**
 * The outline a shell has on screen, which is an ellipse and nothing else.
 *
 * An orthographic camera sends the unit sphere to a filled ellipse, so a shell
 * — a sphere carried by three semi-axes — has an exact elliptical silhouette
 * whatever it is turned to. Taking it as such is what keeps the glass smooth:
 * a tessellated shell is only as round as the number of faces it was cut into,
 * and every seam between two of those faces is a line the reader can see.
 */

import type { ConfidenceEllipsoid } from './confidenceEllipsoid.ts';
import type { OrbitCamera } from './orbitCamera.ts';
import { rotatePoint } from './orbitCamera.ts';

/** Where a shell's outline sits, in cube units, for one camera. */
export interface EllipsoidSilhouette {
  /** Half the outline's longest width, along the angle below. */
  rx: number;
  /** Half its width across that, never longer than `rx`. */
  ry: number;
  /**
   * How far the long axis is turned from the horizontal, in radians, measured
   * the way the screen measures — down from the right — since the projection
   * flips the vertical axis on its way to pixels.
   */
  angle: number;
}

/**
 * The outline of a shell, for the camera it is seen from.
 *
 * The three semi-axes are turned with the camera and their depth dropped,
 * which leaves a `2 x 3` map from the unit sphere to the screen. The image of
 * that sphere is the ellipse whose shape matrix is the map times its own
 * transpose, so the two radii are the square roots of that matrix's
 * eigenvalues and the tilt is half the angle of its off-diagonal term.
 *
 * A group flat in one direction gives a matrix with a zero eigenvalue and
 * comes back as a segment, which is the honest picture of a group that has no
 * spread to show.
 * @param ellipsoid - The shell, in cube units.
 * @param camera - Where the reader is standing.
 * @returns See {@link EllipsoidSilhouette}.
 */
export function ellipsoidSilhouette(
  ellipsoid: ConfidenceEllipsoid,
  camera: OrbitCamera,
): EllipsoidSilhouette {
  const [first, second, third] = ellipsoid.axes;
  const a = rotatePoint(first, camera);
  const b = rotatePoint(second, camera);
  const c = rotatePoint(third, camera);

  // The screen's own frame: across, and down — hence the sign on the second.
  const acrossX = a[0];
  const acrossY = b[0];
  const acrossZ = c[0];
  const downX = -a[1];
  const downY = -b[1];
  const downZ = -c[1];

  const xx = acrossX * acrossX + acrossY * acrossY + acrossZ * acrossZ;
  const yy = downX * downX + downY * downY + downZ * downZ;
  const xy = acrossX * downX + acrossY * downY + acrossZ * downZ;

  const middle = (xx + yy) / 2;
  const spread = Math.hypot((xx - yy) / 2, xy);
  const major = Math.max(0, middle + spread);
  const minor = Math.max(0, middle - spread);

  return {
    rx: Math.sqrt(major),
    ry: Math.sqrt(minor),
    angle: 0.5 * Math.atan2(2 * xy, xx - yy),
  };
}
