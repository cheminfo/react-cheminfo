import type { Molecule } from 'openchemlib';
import { ConformerGenerator } from 'openchemlib';

import type {
  ConformerOptions,
  ConformerStrategy,
} from './conformerOptions.ts';

/** A generator, positioned after the conformers it has already handed back. */
export interface ConformerSession {
  generator: ConformerGenerator;
  /** Conformers handed back so far, kept or dropped. */
  produced: number;
  /**
   * A conformer drawn from the generator but not yet processed, because the
   * deadline passed while it was drawn. Not counted in `produced`.
   */
  pending: Molecule | null;
}

/**
 * A generator for a prepared structure, positioned after `produced` conformers.
 *
 * The generator is seeded, so the same structure and options always hand back
 * the same sequence. The last session is kept, and resumed when it is exactly
 * where the caller left it; otherwise a fresh generator is initialised and the
 * first `produced` conformers are drawn and discarded, which yields the same
 * position without their minimisation.
 * @param prepared - The hydrogen-saturated copy the run embeds.
 * @param options - The options that fixed the sequence: strategy, seed, torsion sets.
 * @param produced - How far into the sequence the caller already is.
 * @returns The session, to be handed back through {@link keepConformerSession}.
 * @throws {Error} When OpenChemLib refuses to initialise the structure.
 */
export function openConformerSession(
  prepared: Molecule,
  options: ConformerOptions,
  produced: number,
): ConformerSession {
  const key = sessionKey(prepared, options);
  if (produced > 0 && last?.key === key && last.session.produced === produced) {
    const session = last.session;
    last = null;
    return session;
  }
  last = null;
  const generator = new ConformerGenerator(options.seed);
  const initialised = generator.initializeConformers(prepared, {
    strategy: strategyConstant(options.strategy),
    maxTorsionSets: options.maxTorsionSets,
    use60degreeSteps: options.use60DegreeSteps,
  });
  if (!initialised) {
    throw new Error(
      `OpenChemLib could not set up conformer generation for ${prepared.getMolecularFormula().formula}. The structure has a problem the generator cannot resolve, such as an impossible valence or an over-constrained ring.`,
    );
  }
  let skipped = 0;
  while (
    skipped < produced &&
    generator.getNextConformerAsMolecule() !== null
  ) {
    skipped++;
  }
  return { generator, produced: skipped, pending: null };
}

/**
 * Keep a session so the next continuation of the same run resumes it.
 * @param prepared - The structure the session was opened on.
 * @param options - The options it was opened with.
 * @param session - The session, positioned where the run stopped.
 */
export function keepConformerSession(
  prepared: Molecule,
  options: ConformerOptions,
  session: ConformerSession,
): void {
  last = { key: sessionKey(prepared, options), session };
}

/**
 * OpenChemLib's estimate of the conformers a session can reach.
 * @param session - A freshly opened session.
 * @returns The estimate, or `-1` when the generator declines to make one.
 */
export function readPotentialCount(session: ConformerSession): number {
  try {
    return session.generator.getPotentialConformerCount();
  } catch {
    return -1;
  }
}

/**
 * Map one of our strategy ids onto the `ConformerGenerator` constant it stands
 * for.
 * @param strategy - The id stored in the preferences.
 * @returns The numeric constant OpenChemLib expects.
 */
export function strategyConstant(strategy: ConformerStrategy): number {
  return STRATEGY_CONSTANTS[strategy];
}

const STRATEGY_CONSTANTS: Record<ConformerStrategy, number> = {
  'adaptive-random': ConformerGenerator.STRATEGY_ADAPTIVE_RANDOM,
  'likely-random': ConformerGenerator.STRATEGY_LIKELY_RANDOM,
  'pure-random': ConformerGenerator.STRATEGY_PURE_RANDOM,
  'likely-systematic': ConformerGenerator.STRATEGY_LIKELY_SYSTEMATIC,
};

let last: { key: string; session: ConformerSession } | null = null;

// The atom order matters as much as the structure, so the molfile is the key.
function sessionKey(prepared: Molecule, options: ConformerOptions): string {
  return [
    options.strategy,
    options.seed,
    options.maxTorsionSets,
    options.use60DegreeSteps,
    prepared.toMolfileV3(),
  ].join('\n');
}
