/** How a drawn structure is matched against a collection. */
export type StructureSearchMode =
  | 'substructure'
  | 'similarity'
  | 'exact'
  | 'exactNoStereo'
  | 'exactNoStereoTautomer';

/**
 * Every mode, in the order a dialog offers them: the two broad scans, then
 * exact and its two relaxations.
 */
export const STRUCTURE_SEARCH_MODES: readonly StructureSearchMode[] = [
  'substructure',
  'similarity',
  'exact',
  'exactNoStereo',
  'exactNoStereoTautomer',
];

/** A structure question: what is drawn, and how it is matched. */
export interface StructureSearchQuery {
  /**
   * The drawing as an idCode, with the coordinates the editor laid out written
   * after a space; empty when nothing is drawn.
   */
  idCode: string;
  /** How the drawing is matched. */
  mode: StructureSearchMode;
  /** The least Tanimoto similarity a hit reaches, from 0 to 1. */
  threshold: number;
}

/** A fragment a drawing can start from. */
export interface StructureSearchExample {
  /** What the button says. */
  label: string;
  /** The fragment, as a SMILES. */
  smiles: string;
  /**
   * One line on what the fragment finds.
   * @default undefined
   */
  help?: string;
}

/**
 * The least similarities offered, as Tanimoto coefficients, in steps of 5 %.
 */
export const SIMILARITY_THRESHOLDS: readonly number[] = [
  0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
];

/**
 * The thresholds to offer when one is already chosen: the usual steps, plus the
 * chosen one when it is none of them, so a link asking for 0.42 still finds it
 * in the list.
 * @param current - The threshold in force.
 * @returns The thresholds, ascending.
 */
export function similarityThresholds(current: number): number[] {
  if (SIMILARITY_THRESHOLDS.includes(current) || !Number.isFinite(current)) {
    return [...SIMILARITY_THRESHOLDS];
  }
  return [...SIMILARITY_THRESHOLDS, current].toSorted(
    (left, right) => left - right,
  );
}
