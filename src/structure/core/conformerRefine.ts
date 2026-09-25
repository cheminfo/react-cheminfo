import { Molecule } from 'openchemlib';

import { ordinal } from '../../format/core/words.ts';

import type { RefinedMinimum } from './conformerRefineRank.ts';
import {
  isRefinedDuplicate,
  rankByRefinedEnergy,
} from './conformerRefineRank.ts';
import { conformerShape } from './conformerShape.ts';
import type { Conformer, ConformerSet } from './conformers.ts';
import type {
  GeometryRelaxer,
  RelaxableGeometry,
  RelaxerOptions,
} from './geometryRelaxer.ts';
import {
  centredRmsd,
  readRelaxableGeometry,
  writeRelaxedCoordinates,
} from './moleculeCoordinates.ts';
import { toMolfileExport } from './molfileExport.ts';

/** What refining one conformer produced, on top of its force-field numbers. */
export interface ConformerRefinement {
  /**
   * The rank this conformer held before the refinement, which is the `id` it
   * carried in the force-field set. Refinement hands the ids out again, so this
   * is what a reader compares the new rank against and what a caller uses to
   * find again the conformer that was on screen.
   */
  forceFieldId: number;
  /** Total energy at the relaxed geometry, kcal/mol. */
  energy: number;
  /** Energy above the most stable refined conformer of the set, kcal/mol. */
  relativeEnergy: number;
  /**
   * The dispersion term of {@link ConformerRefinement.energy}, kcal/mol, or
   * `null` from a method that has none.
   */
  dispersionEnergy: number | null;
  /**
   * The force-field energy this conformer had before, kcal/mol, `null` when it
   * had none. Kept so the two rankings can be read against each other, which is
   * the whole reason to refine.
   */
  forceFieldEnergy: number | null;
  /** How far the atoms moved from the force-field geometry, RMSD in ångström. */
  rmsd: number;
  /** Optimizer cycles spent. */
  cycles: number;
  /** Whether the optimizer met its convergence criteria. */
  converged: boolean;
}

/** What a whole refinement pass produced, recorded on the set. */
export interface ConformerSetRefinement {
  /** The method, as it is shown to a reader, e.g. `GFN2-xTB`. */
  method: string;
  /** Wall-clock duration of the pass, in milliseconds. */
  elapsedMilliseconds: number;
  /** How many conformers were dropped as duplicates of a kept minimum. */
  merged: number;
  /**
   * How many conformers the refined ranking put at a different position,
   * degenerate conformers swapping places included — so it is a fact about the
   * two orders, not a measure of how much the methods disagree. The two relative
   * energies are what a reader should be shown.
   */
  reordered: number;
}

/** How a refinement pass is tuned, watched and cancelled. */
export interface RefineConformersOptions extends RelaxerOptions {
  /**
   * Name of the method, for the label the UI shows.
   * @default 'GFN2-xTB'
   */
  method?: string;
  /**
   * Energy gap in kcal/mol under which two refined conformers are taken to be
   * one minimum.
   * @default REFINED_SAME_ENERGY_TOLERANCE
   */
  sameEnergyTolerance?: number;
}

/**
 * Energy gap in kcal/mol under which two relaxed conformers can be one minimum.
 *
 * Measured with `benchmark/conformerRefine.js scatter`: one butane minimum
 * reached from six geometries perturbed by up to 0.02 Å lands within 4.9e-6
 * kcal/mol, in 8 to 20 optimizer cycles. So 1e-4 is twenty times the scatter of
 * one minimum, and ten times below the closest gap between two real minima seen
 * on a flexible molecule — ibuprofen has distinct conformers 1e-3 kcal/mol
 * apart. The energy is only the cheap half of the test in any case: what decides
 * that two conformers are one minimum is the shape.
 */
export const REFINED_SAME_ENERGY_TOLERANCE = 1e-4;

/** What is shown when a conformer set is ranked by the refined energies. */
export const REFINED_RANKING = 'refined';

/**
 * Relax every conformer of a set with a better method and rank the set by what
 * that method says.
 *
 * This is the opt-in second stage of a conformer search, opt-in because it costs
 * seconds where the force field costs milliseconds. MMFF94 places the atoms well
 * but ranks conformers badly — it has no dispersion and no electronic structure,
 * and those are what decide which conformer is lowest. So both numbers are kept:
 * `conformer.energy` stays the force field's, `conformer.refinement.energy` is
 * the new one, and `set.rankedBy` says which of the two the order follows.
 *
 * Refinement changes the set, not only its order: conformers the force field
 * held apart can relax into one minimum, and the first of them is the one that
 * survives. Ids are handed out again over the ranked result, so a caller holding
 * an id must look its conformer up again.
 *
 * A conformer without a force-field energy is refined like any other; its
 * `forceFieldEnergy` is `null` and it takes its place by the refined energy.
 * @param set - The set to refine. Not modified.
 * @param relax - The engine, e.g. `xtbRelaxer` from `react-cheminfo/xtb`.
 * @param options - Method name, duplicate tolerance, progress and cancellation.
 * @returns A new set, ranked by the refined energies.
 * @throws {Error} When the relaxer fails or is cancelled, or answers with the
 * wrong number of geometries.
 */
export async function refineConformers(
  set: ConformerSet,
  relax: GeometryRelaxer,
  options: RefineConformersOptions = {},
): Promise<ConformerSet> {
  const startedAt = performance.now();
  const method = options.method ?? 'GFN2-xTB';
  if (set.conformers.length === 0) {
    return {
      ...set,
      rankedBy: REFINED_RANKING,
      refinement: { method, elapsedMilliseconds: 0, merged: 0, reordered: 0 },
    };
  }

  const prepared: Array<{
    conformer: Conformer;
    molecule: Molecule;
    geometry: RelaxableGeometry;
  }> = [];
  for (const conformer of set.conformers) {
    const molecule = Molecule.fromMolfile(conformer.molfile.data);
    prepared.push({
      conformer,
      molecule,
      geometry: readRelaxableGeometry(molecule),
    });
  }

  const relaxed = await relax(
    prepared.map((entry) => entry.geometry),
    {
      onSettled: options.onSettled,
      signal: options.signal,
    },
  );
  if (relaxed.length !== set.conformers.length) {
    throw new Error(
      `The relaxer answered with ${relaxed.length} geometries for ${set.conformers.length} conformers.`,
    );
  }

  const tolerance =
    options.sameEnergyTolerance ?? REFINED_SAME_ENERGY_TOLERANCE;
  const warnings = [...set.warnings];
  const kept: Conformer[] = [];
  const minima: RefinedMinimum[] = [];
  let merged = 0;

  for (const [index, entry] of prepared.entries()) {
    const result = relaxed[index];
    if (result === undefined) continue;
    const { conformer, molecule, geometry } = entry;
    writeRelaxedCoordinates(molecule, result.coordinates);
    const candidate: RefinedMinimum = {
      energy: result.energy,
      shape: conformerShape(molecule),
    };
    if (isRefinedDuplicate(candidate, minima, tolerance)) {
      merged++;
      continue;
    }
    for (const warning of result.warnings) {
      warnings.push(`The ${ordinal(conformer.id)} conformer: ${warning}`);
    }
    if (!result.converged) {
      warnings.push(
        `The ${ordinal(conformer.id)} conformer did not reach a ${method} minimum in ${result.cycles} cycles, so its refined energy is an upper bound.`,
      );
    }
    kept.push({
      ...conformer,
      molfile: toMolfileExport(molecule),
      refinement: {
        forceFieldId: conformer.id,
        energy: result.energy,
        relativeEnergy: 0,
        dispersionEnergy: result.dispersionEnergy,
        forceFieldEnergy: conformer.energy,
        rmsd: centredRmsd(geometry.coordinates, result.coordinates),
        cycles: result.cycles,
        converged: result.converged,
      },
    });
    minima.push(candidate);
  }

  if (merged > 0) {
    warnings.push(
      `${merged} conformer(s) relaxed into a ${method} minimum the set already held, so they were dropped.`,
    );
  }
  const ranked = rankByRefinedEnergy(kept);
  return {
    ...set,
    conformers: ranked.conformers,
    warnings,
    rankedBy: REFINED_RANKING,
    refinement: {
      method,
      elapsedMilliseconds: performance.now() - startedAt,
      merged,
      reordered: ranked.reordered,
    },
  };
}
