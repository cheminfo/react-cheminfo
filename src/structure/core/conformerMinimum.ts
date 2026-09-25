import { Molecule } from 'openchemlib';

import type { ConformerShape } from './conformerShape.ts';
import { conformerShape } from './conformerShape.ts';

/** What {@link isKeptMinimum} and {@link minimisedShapes} read of a conformer. */
export interface KeptConformer {
  /** Total energy in kcal/mol, `null` when it was not computed. */
  energy: number | null;
  /** The 3D structure, as molfile text. */
  molfile: { data: string };
}

/**
 * Energy gap, in kcal/mol, under which two minimised conformers can be the
 * same minimum. Copies of one minimum agree to about 1e-7; distinct minima
 * that close in energy differ in shape by more than a percent.
 */
export const SAME_ENERGY_TOLERANCE = 1e-3;

/** Gap between principal moments, relative to the largest, under which two shapes are one. */
export const SAME_SHAPE_TOLERANCE = 1e-3;

/**
 * Gap in chirality under which two shapes are one. Copies of one minimum agree
 * to about 1e-4 and a shape that is its own mirror image reads within 1e-3 of
 * zero, while the mirror images of a chiral minimum usually sit tenths apart.
 */
export const SAME_CHIRALITY_TOLERANCE = 1e-2;

/**
 * Whether two minimised conformers are one energy minimum: the same energy,
 * the same principal moments and the same chirality. The two mirror-image
 * gauche butanes are two minima; the two chairs of cyclohexane, each its own
 * mirror image, are one.
 * @param energyA - Total energy of the first conformer, kcal/mol.
 * @param shapeA - Shape of the first conformer.
 * @param energyB - Total energy of the second conformer, kcal/mol.
 * @param shapeB - Shape of the second conformer.
 * @returns `true` when both agree within {@link SAME_ENERGY_TOLERANCE}, {@link SAME_SHAPE_TOLERANCE} and {@link SAME_CHIRALITY_TOLERANCE}.
 */
export function isSameMinimum(
  energyA: number,
  shapeA: ConformerShape,
  energyB: number,
  shapeB: ConformerShape,
): boolean {
  if (Math.abs(energyA - energyB) > SAME_ENERGY_TOLERANCE) return false;
  return isSameShape(shapeA, shapeB);
}

/**
 * Whether two conformers have the same shape: the same principal moments and
 * the same chirality, energies not consulted. Two mirror images share the
 * moments and not the chirality, so they are two shapes.
 * @param shapeA - Shape of one conformer.
 * @param shapeB - Shape of the other.
 * @returns `true` when both agree within {@link SAME_SHAPE_TOLERANCE} and {@link SAME_CHIRALITY_TOLERANCE}.
 */
export function isSameShape(
  shapeA: ConformerShape,
  shapeB: ConformerShape,
): boolean {
  if (
    Math.abs(shapeA.chirality - shapeB.chirality) > SAME_CHIRALITY_TOLERANCE
  ) {
    return false;
  }
  const momentsA = shapeA.moments;
  const momentsB = shapeB.moments;
  const scale = Math.max(momentsA[2], momentsB[2]);
  for (let axis = 0; axis < 3; axis++) {
    const gap = Math.abs((momentsA[axis] ?? 0) - (momentsB[axis] ?? 0));
    if (gap > SAME_SHAPE_TOLERANCE * scale) return false;
  }
  return true;
}

/**
 * Whether a minimised conformer lands in a minimum one of `kept` already holds.
 * @param energy - Total energy of the candidate, kcal/mol.
 * @param shape - Shape of the candidate.
 * @param kept - The conformers kept so far.
 * @param keptShapes - Their shapes, index for index; `null` where there is no energy.
 * @returns `true` when one of them is the same minimum.
 */
export function isKeptMinimum(
  energy: number,
  shape: ConformerShape,
  kept: readonly KeptConformer[],
  keptShapes: ReadonlyArray<ConformerShape | null>,
): boolean {
  for (let index = 0; index < kept.length; index++) {
    const keptEnergy = kept[index]?.energy ?? null;
    const keptShape = keptShapes[index] ?? null;
    if (
      keptEnergy !== null &&
      keptShape !== null &&
      isSameMinimum(energy, shape, keptEnergy, keptShape)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Shapes of conformers read back from their molfiles, so a continuation
 * compares new conformers with the ones a previous run kept.
 * @param conformers - Conformers of an earlier run.
 * @returns Their shapes, index for index; `null` for one without an energy.
 */
export function minimisedShapes(
  conformers: readonly KeptConformer[],
): Array<ConformerShape | null> {
  const shapes: Array<ConformerShape | null> = [];
  for (const conformer of conformers) {
    shapes.push(
      conformer.energy === null
        ? null
        : conformerShape(Molecule.fromMolfile(conformer.molfile.data)),
    );
  }
  return shapes;
}
