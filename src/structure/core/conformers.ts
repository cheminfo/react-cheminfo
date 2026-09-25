import type { Molecule } from 'openchemlib';

import { ordinal } from '../../format/core/words.ts';

import { minimiseConformer, rankByEnergy } from './conformerMinimise.ts';
import { isKeptMinimum, minimisedShapes } from './conformerMinimum.ts';
import type {
  ConformerOptions,
  MinimisationAlgorithm,
} from './conformerOptions.ts';
import type {
  ConformerRefinement,
  ConformerSetRefinement,
} from './conformerRefine.ts';
import type { ConformerSession } from './conformerSession.ts';
import {
  keepConformerSession,
  openConformerSession,
  readPotentialCount,
} from './conformerSession.ts';
import type { ConformerShape } from './conformerShape.ts';
import { conformerShape, hasFiniteCoordinates } from './conformerShape.ts';
import type { MolfileExport } from './molfileExport.ts';
import { toMolfileExport } from './molfileExport.ts';

export { strategyConstant } from './conformerSession.ts';

/** One conformer of the input structure, ready to display and to export. */
export interface Conformer {
  /** 1-based position in {@link ConformerSet.conformers}. */
  id: number;
  /** The 3D structure, as a molfile the viewer can parse. */
  molfile: MolfileExport;
  /** Total force-field energy in kcal/mol, `null` when it was not computed. */
  energy: number | null;
  /** Energy above the lowest conformer of the set, `null` without an energy. */
  relativeEnergy: number | null;
  /**
   * What a better method said about this conformer, once `refineConformers` has
   * relaxed it. `null` until then, which is what a plain force-field run leaves.
   * @default null
   */
  refinement: ConformerRefinement | null;
}

/**
 * Which energies a set is ordered by: the force field's own, or the ones a
 * refinement pass produced.
 */
export type ConformerRanking = 'force-field' | 'refined';

/** Why {@link generateConformers} stopped asking for more conformers. */
export type StopReason = 'exhausted' | 'count' | 'timeout';

/** The complete outcome of one conformer run. */
export interface ConformerSet {
  /** The conformers kept, most stable first; one without an energy follows every one that has one. */
  conformers: Conformer[];
  /** OpenChemLib's estimate of the reachable conformers, `-1` when unavailable. */
  potentialConformerCount: number;
  /** Which of the three limits ended the run. */
  stoppedBy: StopReason;
  /** Wall-clock duration of the run, initialisation and continuations included. */
  elapsedMilliseconds: number;
  /** Plain sentences about conformers that were dropped or left unminimised. */
  warnings: string[];
  /** The force field that was asked for, echoed so a reader knows what the energies mean. */
  minimisation: MinimisationAlgorithm;
  /** Conformers the generator handed back, dropped ones included: where a continuation resumes. */
  produced: number;
  /** The options of the run, so a continuation draws from the same sequence. */
  options: ConformerOptions;
  /** Which of the two energies {@link ConformerSet.conformers} is ordered by. */
  rankedBy: ConformerRanking;
  /**
   * What the refinement pass did, `null` for a set no better method has seen.
   * @default null
   */
  refinement: ConformerSetRefinement | null;
}

/** The two options a continuation takes from the caller rather than from the run. */
export type ConformerLimits = Pick<
  ConformerOptions,
  'maxConformers' | 'timeoutSeconds'
>;

/**
 * Generate conformers of a structure, optionally relaxing each one with MMFF94.
 *
 * The caller's molecule is never touched: the run works on a compact copy that
 * receives the explicit hydrogens the generator needs.
 *
 * The run ends on the first of three limits — the generator runs out of new
 * torsion sets, `maxConformers` conformers are in hand, or the time budget is
 * spent. **A timeout is not an error**: whatever was produced is returned, with
 * `stoppedBy` saying why there is not more.
 *
 * The budget covers the whole call, initialisation included, and is read again
 * once a conformer is in hand, so no further minimisation starts past the
 * deadline. The one step already running cannot be cut short, so a caller
 * waiting from another thread must allow one step on top of `timeoutSeconds`.
 *
 * Minimisation is best-effort: a conformer MMFF94 refuses is kept with a `null`
 * energy and a warning rather than lost. A minimised conformer that lands in a
 * minimum already kept, such as the flipped copy of a cyclohexane chair, is
 * not kept a second time; the mirror image of a chiral minimum, such as the
 * second gauche butane, is a minimum of its own.
 * @param molecule - Structure to embed. Not mutated.
 * @param options - Strategy, limits, seed and force field.
 * @param now - Clock used for the time budget, injectable for tests.
 * @returns Every conformer kept, most stable first, with relative energies and any warnings.
 * @throws {Error} When the structure is empty or OpenChemLib refuses to initialise it.
 */
export function generateConformers(
  molecule: Molecule,
  options: ConformerOptions,
  now: () => number = defaultClock,
): ConformerSet {
  return runConformers(molecule, options, null, now);
}

/**
 * Ask the run that produced `previous` for more conformers.
 *
 * The continuation draws from the same seeded sequence with the same force
 * field, so the result is the set a single larger run would have produced:
 * the new conformers are ranked among the previous ones, the ids follow that
 * order, and every relative energy is measured again from the lowest of all.
 * A refined set cannot be extended: its molfiles hold the relaxed geometries
 * while its `energy` fields still hold the force field's numbers, so the two
 * would no longer describe one conformer and the duplicate check would compare
 * shapes against energies that do not belong to them. Generate a larger set and
 * refine that instead.
 * @param molecule - The structure `previous` was generated from. Not mutated.
 * @param previous - The set to extend. Not mutated.
 * @param limits - How many more conformers to find, and the time budget of this call.
 * @param now - Clock used for the time budget, injectable for tests.
 * @returns The extended set, its duration the sum of both runs.
 * @throws {Error} When the structure is empty, when `previous` has been refined,
 * or when OpenChemLib refuses to initialise it.
 */
export function continueConformers(
  molecule: Molecule,
  previous: ConformerSet,
  limits: ConformerLimits,
  now: () => number = defaultClock,
): ConformerSet {
  const options: ConformerOptions = {
    ...previous.options,
    maxConformers: limits.maxConformers,
    timeoutSeconds: limits.timeoutSeconds,
  };
  return runConformers(molecule, options, previous, now);
}

function defaultClock(): number {
  return performance.now();
}

interface Accumulator {
  conformers: Conformer[];
  /** Shape of each conformer, `null` for one without an energy. */
  shapes: Array<ConformerShape | null>;
  warnings: string[];
}

function runConformers(
  molecule: Molecule,
  options: ConformerOptions,
  previous: ConformerSet | null,
  now: () => number,
): ConformerSet {
  if (previous?.refinement != null) {
    throw new Error(
      `This set was refined with ${previous.refinement.method}, so it cannot be extended. Generate a larger set, then refine it again.`,
    );
  }
  const prepared = molecule.getCompactCopy();
  prepared.addImplicitHydrogens();
  if (prepared.getAllAtoms() === 0) {
    throw new Error('The structure is empty: there is nothing to embed in 3D.');
  }

  // Setting up the torsion sets is the slow half of a flexible run — seconds on
  // a long chain — so it is inside both the budget and the reported duration.
  const start = now();
  const session = openConformerSession(
    prepared,
    options,
    previous?.produced ?? 0,
  );
  const potentialConformerCount =
    previous?.potentialConformerCount ?? readPotentialCount(session);
  const conformers =
    previous === null ? [] : copyConformers(previous.conformers);
  const into: Accumulator = {
    conformers,
    shapes: minimisedShapes(conformers),
    warnings: previous === null ? [] : [...previous.warnings],
  };
  const budget = Math.max(options.timeoutSeconds * 1000, 0);
  const stoppedBy = collect(
    session,
    options,
    into.conformers.length + options.maxConformers,
    () => now() - start >= budget,
    into,
  );
  keepConformerSession(prepared, options, session);

  return {
    conformers: rankByEnergy(into.conformers),
    potentialConformerCount,
    stoppedBy,
    elapsedMilliseconds: (previous?.elapsedMilliseconds ?? 0) + now() - start,
    warnings: into.warnings,
    minimisation: options.minimisation,
    produced: session.produced,
    options,
    rankedBy: 'force-field',
    refinement: null,
  };
}

function collect(
  session: ConformerSession,
  options: ConformerOptions,
  target: number,
  spent: () => boolean,
  into: Accumulator,
): StopReason {
  while (true) {
    if (into.conformers.length >= target) return 'count';
    if (spent()) return 'timeout';
    const conformer =
      session.pending ?? session.generator.getNextConformerAsMolecule();
    session.pending = null;
    if (conformer === null) return 'exhausted';
    // Minimisation runs to completion once entered, so a conformer that arrives
    // past the deadline is kept aside for a continuation rather than bought now.
    if (spent()) {
      session.pending = conformer;
      return 'timeout';
    }
    session.produced++;
    if (!hasFiniteCoordinates(conformer)) {
      into.warnings.push(
        `The ${ordinal(session.produced)} conformer produced was dropped: the generator placed some of its atoms at non-finite coordinates.`,
      );
      continue;
    }
    const energy = minimiseConformer(
      conformer,
      options,
      session.produced,
      into.warnings,
    );
    const shape = energy === null ? null : conformerShape(conformer);
    if (
      energy !== null &&
      shape !== null &&
      isKeptMinimum(energy, shape, into.conformers, into.shapes)
    ) {
      continue;
    }
    into.conformers.push({
      id: into.conformers.length + 1,
      molfile: toMolfileExport(conformer),
      energy,
      relativeEnergy: null,
      refinement: null,
    });
    into.shapes.push(shape);
  }
}

function copyConformers(conformers: readonly Conformer[]): Conformer[] {
  const copies: Conformer[] = [];
  for (const conformer of conformers) copies.push({ ...conformer });
  return copies;
}
