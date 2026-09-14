/**
 * The outline a shell has on screen, which is an ellipse and nothing else.
 *
 * An orthographic camera sends the unit sphere to a filled ellipse, so a shell
 * — a sphere carried by three semi-axes — has an exact elliptical silhouette
 * whatever it is turned to. Drawing it as that one ellipse is what keeps the
 * glass smooth at any zoom and free of seams.
 */

import { ellipseAxes } from '../../scatter/core/ellipseAxes.ts';

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
 * transpose — a covariance in all but name — so it is decomposed by the same
 * `ellipseAxes` a map outline is, collinear floor included.
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

  // The shape matrix is already in the screen's own frame, so the angle the
  // decomposition reports is measured down from the right with no conversion.
  return ellipseAxes({ xx, xy, yy });
}
