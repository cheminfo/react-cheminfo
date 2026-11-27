/**
 * What a conformer run hands back: the conformers, the set they make and why
 * it stopped. Types only, so a module that reads a set — the energies `./core`
 * loads among them — never reaches the code that drives OpenChemLib.
 */

import type { LogLine } from '../../log/core/logGroups.ts';

import type {
  ConformerOptions,
  MinimisationAlgorithm,
} from './conformerOptions.ts';
import type {
  ConformerRefinement,
  ConformerSetRefinement,
} from './conformerRefine.ts';
import type { MolfileExport } from './molfileExport.ts';

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

/** Why `generateConformers` stopped asking for more conformers. */
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
  /**
   * What the run has to say: conformers dropped (`error`), left without an
   * energy (`warn`), merged by a refinement (`info`). Plain, so the set can be
   * posted from a worker and saved in a figure with them.
   */
  logs: LogLine[];
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
