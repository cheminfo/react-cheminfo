/**
 * The geometry of the cartesian frame: three rods through the origin and the
 * three letters that name them.
 *
 * It is arithmetic over positions, which is why it is here rather than in
 * `renderAxes.ts` — that module is about representations, exactly as
 * `volumeField.ts` is to `renderVolume.ts`.
 */

import { addCylinder } from 'molstar/lib/mol-geo/geometry/mesh/builder/cylinder.js';
import { MeshBuilder } from 'molstar/lib/mol-geo/geometry/mesh/mesh-builder.js';
import type { Mesh } from 'molstar/lib/mol-geo/geometry/mesh/mesh.js';
import { TextBuilder } from 'molstar/lib/mol-geo/geometry/text/text-builder.js';
import type { Text } from 'molstar/lib/mol-geo/geometry/text/text.js';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';

/** How far a rod, and a label, sit from the origin as fractions of the reach. */
export const ROD_LENGTH = 1.06;
export const LABEL_SIZE = 0.1;

/** Rod radius, as a fraction of the reach. */
const ROD_RADIUS = 0.006;

/** Arrowhead length as a fraction of the rod's half-length. */
const HEAD_LENGTH = 0.06;

/** Arrowhead radius as a multiple of the rod's. */
const HEAD_FLARE = 4;

/** x, y and z, in the order their labels are given in. */
const AXIS_DIRECTIONS = [
  Vec3.create(1, 0, 0),
  Vec3.create(0, 1, 0),
  Vec3.create(0, 0, 1),
] as const;

/**
 * Three rods through the origin, each with an arrowhead on its positive end.
 * @param reach - How far the orbital reaches, in scene units.
 * @returns The mesh, one group per axis.
 */
export function buildAxisRods(reach: number): Mesh {
  const state = MeshBuilder.createState(1024, 512);
  const length = reach * ROD_LENGTH;
  const radius = reach * ROD_RADIUS;
  const head = length * HEAD_LENGTH;
  for (const [axis, direction] of AXIS_DIRECTIONS.entries()) {
    state.currentGroup = axis;
    const start = Vec3.scale(Vec3.zero(), direction, -length);
    const neck = Vec3.scale(Vec3.zero(), direction, length - head);
    const tip = Vec3.scale(Vec3.zero(), direction, length);
    addCylinder(state, start, neck, 1, {
      radiusTop: radius,
      radiusBottom: radius,
      topCap: true,
      bottomCap: true,
      radialSegments: 12,
    });
    addCylinder(state, neck, tip, 1, {
      radiusTop: 0,
      radiusBottom: radius * HEAD_FLARE,
      topCap: true,
      bottomCap: true,
      radialSegments: 16,
    });
  }
  return MeshBuilder.getMesh(state);
}

/**
 * One label just beyond each arrowhead.
 * @param at - Distance from the origin the labels sit at, in scene units.
 * @param labels - What the axes are called, in x, y, z order.
 * @returns The text geometry, one group per axis.
 */
export function buildAxisLabels(at: number, labels: readonly string[]): Text {
  const builder = TextBuilder.create({}, 3, 3);
  for (const [axis, direction] of AXIS_DIRECTIONS.entries()) {
    const position = Vec3.scale(Vec3.zero(), direction, at);
    builder.add(
      labels[axis] ?? '',
      position[0] as number,
      position[1] as number,
      position[2] as number,
      0,
      1,
      axis,
    );
  }
  return builder.getText();
}
