/**
 * Turning a field the caller sampled into the `Volume` molstar's isosurface
 * renderer wants.
 *
 * It is arithmetic over the samples, which is why it is here rather than in
 * `renderVolume.ts` — that module is about representations. How far the
 * surface inside the box reaches is measured in `core/isovalue.ts`, beside the
 * isovalue it is measured against.
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
