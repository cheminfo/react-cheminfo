/**
 * Turning a field the caller sampled into the `Volume` molstar's isosurface
 * renderer wants, and measuring how far the surface inside it actually reaches.
 *
 * Both halves are arithmetic over the samples, which is why they are here
 * rather than in `renderVolume.ts` — that module is about representations.
 */

import { Mat4, Tensor, Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import { CustomProperties } from 'molstar/lib/mol-model/custom-property.js';
import type { Grid, Volume } from 'molstar/lib/mol-model/volume.js';

import type { OrbitalGrid } from '../core/grid.ts';

// Lowercased on destructuring: both are factories, not constructors.
const { Space: createTensorSpace, Data1: asTensorData } = Tensor;

/**
 * Radius, in scene units, every atomic orbital is drawn at.
 *
 * Comfortably clear of molstar's `minNear` of 5 and of the floor its camera
 * puts under the target distance, both of which make a sub-ångström object
 * impossible to fill the frame with.
 */
export const DISPLAY_REACH = 12;

/**
 * How far from the centre of the box the drawn surface actually reaches.
 *
 * Molstar sizes a volume representation's bounding sphere from the whole
 * sampled box, which is deliberately much larger than the isosurface inside it,
 * so a camera framing that sphere leaves the orbital a quarter of the frame
 * wide. Measuring the samples that are actually enclosed gives the camera the
 * real extent, and does it here because this is where the isovalue is known.
 * @param field - The sampled field.
 * @param isovalues - The two isovalues the surfaces were drawn at.
 * @param isovalues.negative - Isovalue the negative lobe was drawn at, if any.
 * @param isovalues.positive - Isovalue the positive lobe was drawn at, if any.
 * @returns The reach in ångström, or 0 when nothing was drawn.
 */
export function surfaceReach(
  field: OrbitalGrid,
  isovalues: { negative?: number | undefined; positive?: number | undefined },
): number {
  const cutoff = Math.min(
    Math.abs(isovalues.positive ?? Infinity),
    Math.abs(isovalues.negative ?? Infinity),
  );
  if (!Number.isFinite(cutoff) || cutoff <= 0) return 0;
  const { data, dimensions, origin, spacing } = field;
  const [countX, countY, countZ] = dimensions;
  const centreX = origin.x + ((countX - 1) * spacing) / 2;
  const centreY = origin.y + ((countY - 1) * spacing) / 2;
  const centreZ = origin.z + ((countZ - 1) * spacing) / 2;
  let furthest = 0;
  let index = 0;
  for (let indexX = 0; indexX < countX; indexX++) {
    const dx = origin.x + indexX * spacing - centreX;
    for (let indexY = 0; indexY < countY; indexY++) {
      const dy = origin.y + indexY * spacing - centreY;
      for (let indexZ = 0; indexZ < countZ; indexZ++) {
        const value = data[index++] as number;
        if (value < cutoff && value > -cutoff) continue;
        const dz = origin.z + indexZ * spacing - centreZ;
        const squared = dx * dx + dy * dy + dz * dz;
        if (squared > furthest) furthest = squared;
      }
    }
  }
  return Math.sqrt(furthest);
}

/**
 * Wrap a sampled field in molstar's `Volume`.
 *
 * The grid-to-cartesian transform is built here rather than through the
 * alpha-orbitals helper, which expects its box in bohr and converts on the way
 * out; our fields are already in ångström and a round trip through two slightly
 * different bohr constants is a needless source of drift.
 * @param field - The sampled field.
 * @param displayScale - Factor applied to every coordinate, so a tight orbital
 * can be drawn at a size the camera can actually frame.
 * @returns The volume, ready for an isosurface representation.
 */
export function toVolume(field: OrbitalGrid, displayScale: number): Volume {
  const { data, dimensions, origin, spacing, min, max, mean, sigma } = field;
  const step = spacing * displayScale;
  const scale = Mat4.fromScaling(Mat4.zero(), Vec3.create(step, step, step));
  const translate = Mat4.fromTranslation(
    Mat4.zero(),
    Vec3.create(
      origin.x * displayScale,
      origin.y * displayScale,
      origin.z * displayScale,
    ),
  );
  const grid: Grid = {
    transform: {
      kind: 'matrix',
      matrix: Mat4.mul(Mat4.zero(), translate, scale),
    },
    // [0, 1, 2] is the axis order `evaluateGrid` writes: z varies fastest.
    cells: Tensor.create(
      createTensorSpace(dimensions, [0, 1, 2], Float32Array),
      asTensorData(data),
    ),
    stats: {
      min,
      max,
      mean,
      // molstar's `sigma` is the root mean square, not the standard deviation,
      // and its volume themes read it that way.
      sigma: Math.hypot(sigma, mean),
    },
  };
  return {
    grid,
    instances: [{ transform: Mat4.identity() }],
    sourceData: {
      name: 'react-cheminfo sampled orbital',
      kind: 'atomic-orbital-field',
      data,
    },
    customProperties: new CustomProperties(),
    _propertyData: Object.create(null) as Record<string, unknown>,
    _localPropertyData: Object.create(null) as Record<string, unknown>,
  };
}
