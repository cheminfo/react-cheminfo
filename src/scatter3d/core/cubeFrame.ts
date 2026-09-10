/**
 * The box the cloud sits in.
 *
 * A cloud of dots on an empty background has no orientation at all: turn it
 * and nothing tells the reader it turned, and a dot near the top could be near
 * or far. Twelve faint edges and three labelled arms fix that for the cost of
 * fifteen lines, and they are the reason the projection can stay orthographic
 * — the frame carries the depth that perspective would otherwise have to, and
 * unlike perspective it distorts no distance.
 */

import type { Vector3 } from './orbitCamera.ts';

/** The corner the three labelled arms are drawn from. */
export const CUBE_ORIGIN: Vector3 = [-1, -1, -1];

/**
 * The twelve edges of the cube, each as its two corners.
 *
 * Every edge, not just the three at the back: which edges are hidden changes
 * as the box turns, and drawing all twelve faintly reads as a wireframe, while
 * drawing three reads as an axis system that keeps rearranging itself.
 * @returns The edges. The order is stable but carries no meaning.
 */
export function cubeEdges(): Array<[Vector3, Vector3]> {
  const corners: Vector3[] = [];
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) corners.push([x, y, z]);
    }
  }

  const edges: Array<[Vector3, Vector3]> = [];
  for (let i = 0; i < corners.length; i++) {
    for (let j = i + 1; j < corners.length; j++) {
      const a = corners[i] as Vector3;
      const b = corners[j] as Vector3;
      // Two corners are joined by an edge exactly when they differ in one
      // coordinate; differing in two is a face diagonal and in three is the
      // body diagonal, and drawing either would turn the frame into a mesh.
      const differing =
        (a[0] === b[0] ? 0 : 1) +
        (a[1] === b[1] ? 0 : 1) +
        (a[2] === b[2] ? 0 : 1);
      if (differing === 1) edges.push([a, b]);
    }
  }
  return edges;
}

/** One labelled arm of the frame. */
export interface CubeArm {
  /** Which of the three axes it stands for. */
  axis: 'x' | 'y' | 'z';
  /** The far end of the arm. */
  end: Vector3;
  /** Where its name is written, just beyond the end. */
  label: Vector3;
}

/**
 * The three arms, from the origin corner along each axis.
 *
 * The label sits a little past the end of its arm so that it is outside the
 * cloud whatever the box is turned to; at the end itself it would fall on the
 * frame from about a third of the angles.
 */
export const CUBE_ARMS: readonly CubeArm[] = [
  { axis: 'x', end: [1, -1, -1], label: [1.18, -1, -1] },
  { axis: 'y', end: [-1, 1, -1], label: [-1, 1.18, -1] },
  { axis: 'z', end: [-1, -1, 1], label: [-1, -1, 1.18] },
];
