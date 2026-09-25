import type { Molecule } from 'openchemlib';
import { ForceFieldMMFF94 } from 'openchemlib';

import { ordinal } from '../../format/core/words.ts';

import type { ConformerOptions } from './conformerOptions.ts';

/**
 * Relax one conformer in place and return its energy.
 *
 * Minimisation is best-effort. MMFF94 cannot type every element (boron, for
 * one), so a conformer it refuses gets a `null` energy and a warning rather
 * than an exception. A non-zero return code from `minimise()` is *not* a
 * failure: ethyne returns 2 with a perfect geometry.
 *
 * Warnings count the conformers the generator handed back, kept or not, so one
 * number never means two things — a row number would, once one is dropped.
 * @param conformer - The conformer to relax. Mutated.
 * @param options - Force field and iteration budget.
 * @param produced - 1-based position of the conformer in the generator's output.
 * @param warnings - Receives one sentence when the energy is unknown.
 * @returns Total energy in kcal/mol, or `null` when none was computed.
 */
export function minimiseConformer(
  conformer: Molecule,
  options: ConformerOptions,
  produced: number,
  warnings: string[],
): number | null {
  const algorithm = options.minimisation;
  if (algorithm === 'none') return null;
  let energy: number;
  try {
    const forceField = new ForceFieldMMFF94(conformer, algorithm, {});
    forceField.minimise({ maxIts: options.maxIterations });
    energy = forceField.getTotalEnergy();
  } catch (error) {
    warnings.push(
      `The ${ordinal(produced)} conformer produced could not be minimised with ${algorithm} (${readable(error)}), so its energy is unknown.`,
    );
    return null;
  }
  if (!Number.isFinite(energy)) {
    warnings.push(
      `The ${ordinal(produced)} conformer produced minimised to a non-finite ${algorithm} energy, so its energy is unknown.`,
    );
    return null;
  }
  return energy;
}

/** What {@link rankByEnergy} reads and rewrites on a conformer. */
export interface RankedConformer {
  id: number;
  energy: number | null;
  relativeEnergy: number | null;
}

/**
 * Order a set from the most stable conformer down, number it from one in that
 * order, and measure every known energy from the lowest.
 *
 * A conformer without an energy ranks after every one that has one; equal
 * energies, and conformers without one, keep the order they came in.
 * @param conformers - The set. Each `id` and `relativeEnergy` is rewritten in place.
 * @returns The same conformers, most stable first.
 */
export function rankByEnergy<T extends RankedConformer>(
  conformers: readonly T[],
): T[] {
  assignRelativeEnergies(conformers);
  const ranked = conformers.toSorted(compareEnergy);
  for (const [index, conformer] of ranked.entries()) conformer.id = index + 1;
  return ranked;
}

function compareEnergy(a: RankedConformer, b: RankedConformer): number {
  if (a.energy === null) return b.energy === null ? 0 : 1;
  if (b.energy === null) return -1;
  return a.energy - b.energy;
}

function assignRelativeEnergies(conformers: readonly RankedConformer[]): void {
  let lowest = Number.POSITIVE_INFINITY;
  for (const conformer of conformers) {
    const energy = conformer.energy;
    if (energy !== null && energy < lowest) lowest = energy;
  }
  if (lowest === Number.POSITIVE_INFINITY) return;
  for (const conformer of conformers) {
    const energy = conformer.energy;
    if (energy !== null) conformer.relativeEnergy = energy - lowest;
  }
}

function readable(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/^\w+\$\w+: /, '');
}
