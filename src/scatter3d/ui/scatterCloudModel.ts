/**
 * What a cloud is made of before any of it is drawn: the shell around each
 * group, and the sentence a screen reader is given instead of the picture.
 *
 * It is kept out of the component for the same reason the flat scatter's model
 * is — a shell has to be cut before there is anything to project, and cutting
 * it inside the render callback would cut it again on every turn.
 */

import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import type { ScatterGroupInk } from '../../scatter/ui/scatterPlotModel.ts';
import type { ScatterGroup } from '../../scatter/ui/scatterPlotProps.ts';
import { confidenceEllipsoid } from '../core/confidenceEllipsoid.ts';
import type { Vector3 } from '../core/orbitCamera.ts';

import type { CloudShell } from './CloudShellLayer.tsx';

/** What {@link cloudShells} needs to fit one shell per group. */
export interface CloudShellsInput {
  /** Every sample, in cube units. */
  cube: readonly Vector3[];
  /** Which group each sample belongs to, as an index into `groups`. */
  groupOf: ArrayLike<number>;
  /** The groups, in the order they are coloured. */
  groups: readonly ScatterGroup[];
  /** The colour and the strength each group is drawn at. */
  ink: ScatterGroupInk;
  /** How large the shells are. */
  size: EllipseSize;
  /**
   * How many samples a group needs before it is given a shell.
   * @default 4
   */
  minimumPoints?: number;
}

/**
 * One shell per group that has enough samples to have a shape.
 *
 * The shells are fitted in cube units rather than in the data's own, because
 * the three axes were stretched to one cube and a shell fitted before that
 * stretch would not sit on the cloud the reader is looking at. It is the same
 * reasoning the map uses when it fits its outlines in pixels.
 *
 * A group the reader has switched off in the legend keeps its shell and loses
 * its strength, so the shape it was making is still visible behind the groups
 * that are left — which is the whole point of switching one off.
 * @param input - See {@link CloudShellsInput}.
 * @returns The shells, in group order. A group too small for a shape is left out rather than given a shell that describes its handful of samples.
 */
export function cloudShells(input: CloudShellsInput): CloudShell[] {
  const { cube, groupOf, groups, ink, size, minimumPoints } = input;

  const held: Vector3[][] = groups.map(() => []);
  const count = Math.min(cube.length, groupOf.length);
  for (let index = 0; index < count; index++) {
    const group = groupOf[index];
    if (group === undefined || group < 0 || group >= groups.length) continue;
    (held[group] as Vector3[]).push(cube[index] as Vector3);
  }

  const shells: CloudShell[] = [];
  for (const [group, entry] of groups.entries()) {
    const ellipsoid = confidenceEllipsoid(held[group] as Vector3[], {
      size,
      minimumPoints,
    });
    if (ellipsoid === null) continue;
    shells.push({
      id: entry.id,
      color: ink.colors[group] ?? entry.color,
      ellipsoid,
      opacity: ink.opacities[group] ?? 1,
    });
  }
  return shells;
}

/**
 * What a screen reader is told the figure shows.
 *
 * It names all three axes, because a reader who cannot see the box has no
 * frame to read them off, and the frame is where a sighted reader learns which
 * axis is which.
 * @param xLabel - What the axis running left to right is called.
 * @param yLabel - What the axis running bottom to top is called.
 * @param zLabel - What the axis running away from the reader is called.
 * @param count - How many samples there are.
 * @returns The sentence.
 */
export function cloudLabel(
  xLabel: string,
  yLabel: string,
  zLabel: string,
  count: number,
): string {
  return `A three-dimensional scatter plot of ${count} samples: ${xLabel} across, ${yLabel} up, and ${zLabel} into the picture.`;
}
