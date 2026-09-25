/** The four torsion-set strategies OpenChemLib's `ConformerGenerator` offers. */
export const CONFORMER_STRATEGIES = [
  'adaptive-random',
  'likely-random',
  'pure-random',
  'likely-systematic',
] as const;

/** One of {@link CONFORMER_STRATEGIES}. */
export type ConformerStrategy = (typeof CONFORMER_STRATEGIES)[number];

/** Short names for the strategy picker. */
export const STRATEGY_LABELS: Record<ConformerStrategy, string> = {
  'adaptive-random': 'Adaptive random',
  'likely-random': 'Likely random',
  'pure-random': 'Pure random',
  'likely-systematic': 'Likely systematic',
};

/** One sentence per strategy, shown as help text next to the picker. */
export const STRATEGY_DETAILS: Record<ConformerStrategy, string> = {
  'adaptive-random':
    'Draws torsions at random but steers away from the combinations that already collided, which covers a flexible molecule fastest.',
  'likely-random':
    'Draws torsions at random from the torsion database, weighted by how often each angle is seen in crystal structures.',
  'pure-random':
    'Draws every torsion uniformly at random, ignoring how likely the angle is — the widest spread and the least realistic set.',
  'likely-systematic':
    'Walks the torsion combinations in decreasing likelihood, so the first conformers are the most probable ones and the set is reproducible.',
};

/** Force fields offered for the optional minimisation step. */
export const MINIMISATION_ALGORITHMS = [
  'none',
  'MMFF94',
  'MMFF94s',
  'MMFF94s+',
] as const;

/** One of {@link MINIMISATION_ALGORITHMS}. */
export type MinimisationAlgorithm = (typeof MINIMISATION_ALGORITHMS)[number];

/** Short names for the minimisation picker. */
export const MINIMISATION_LABELS: Record<MinimisationAlgorithm, string> = {
  none: 'None (no energies)',
  MMFF94: 'MMFF94',
  MMFF94s: 'MMFF94s',
  'MMFF94s+': 'MMFF94s+',
};

/** Everything a conformer run needs, in one serialisable object. */
export interface ConformerOptions {
  /** Which torsion-set strategy the generator follows. */
  strategy: ConformerStrategy;
  /** Upper bound on the number of conformers kept. */
  maxConformers: number;
  /** Upper bound on the distinct torsion sets the strategy will try. */
  maxTorsionSets: number;
  /** Rotate every rotatable bond in 60° steps instead of using the torsion database. */
  use60DegreeSteps: boolean;
  /** Seed of the generator's random source, so a run is reproducible. */
  seed: number;
  /** Force field used to relax each conformer; `none` leaves the energies unknown. */
  minimisation: MinimisationAlgorithm;
  /** Iteration budget of a single minimisation. */
  maxIterations: number;
  /** Wall-clock budget of the whole run, in seconds. */
  timeoutSeconds: number;
}

/** The settings a first-time visitor gets. */
export const DEFAULT_CONFORMER_OPTIONS: ConformerOptions = {
  strategy: 'adaptive-random',
  maxConformers: 10,
  maxTorsionSets: 10_000,
  use60DegreeSteps: false,
  seed: 42,
  minimisation: 'MMFF94s+',
  maxIterations: 4000,
  timeoutSeconds: 10,
};

/**
 * Whether two option sets would run the same calculation.
 * @param first - One option set.
 * @param second - The other.
 * @returns `true` when every option is equal.
 */
export function sameConformerOptions(
  first: ConformerOptions,
  second: ConformerOptions,
): boolean {
  for (const key of Object.keys(first) as Array<keyof ConformerOptions>) {
    if (first[key] !== second[key]) return false;
  }
  return true;
}

/**
 * Rotatable-bond count above which the conformer space is large enough that the
 * run is worth warning about before it starts.
 */
export const ROTATABLE_BOND_WARNING = 12;

/**
 * Narrow an arbitrary string, typically a URL parameter or a stored preference,
 * to a strategy id.
 * @param value - Text to test.
 * @returns Whether `value` is one of {@link CONFORMER_STRATEGIES}.
 */
export function isConformerStrategy(value: string): value is ConformerStrategy {
  return (CONFORMER_STRATEGIES as readonly string[]).includes(value);
}

/**
 * Narrow an arbitrary string, typically a stored preference, to a force-field
 * id.
 * @param value - Text to test.
 * @returns Whether `value` is one of {@link MINIMISATION_ALGORITHMS}.
 */
export function isMinimisationAlgorithm(
  value: string,
): value is MinimisationAlgorithm {
  return (MINIMISATION_ALGORITHMS as readonly string[]).includes(value);
}
