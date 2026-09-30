/**
 * The columns a conformer table can draw, and the two sets a site usually
 * wants.
 *
 * Their own module so `ConformerTable.tsx` exports a component and nothing
 * else, which is what keeps fast refresh working on the sites that render it.
 */

/** One column of a conformer table. */
export type ConformerColumn =
  /** The 1-based rank, which is also the conformer's id. */
  | 'id'
  /** The Boltzmann share, as a bar and a percentage. */
  | 'population'
  /** Energy above the most stable conformer, in the active ranking. */
  | 'relative'
  /** Total energy, in the active ranking. */
  | 'total'
  /** What the force field said before a refinement reordered the set. */
  | 'forceFieldRelative'
  /** The rank the conformer held before a refinement reordered the set. */
  | 'forceFieldRank';

/** The columns a picker needs: which shape, how much of it, how far up. */
export const PICKER_COLUMNS: readonly ConformerColumn[] = [
  'id',
  'population',
  'relative',
];

/** The columns a reader of the ranking itself needs. */
export const RANKING_COLUMNS: readonly ConformerColumn[] = [
  'id',
  'population',
  'relative',
  'total',
];

/** The heading of each column. The unit lives here, never in a cell. */
export const CONFORMER_COLUMN_LABELS: Record<ConformerColumn, string> = {
  id: '#',
  population: 'share',
  relative: 'ΔE kcal/mol',
  total: 'total kcal/mol',
  forceFieldRelative: 'force field ΔE',
  forceFieldRank: 'force field rank',
};

/** The columns whose cells are numbers, and so are right-aligned and tabular. */
export const NUMERIC_CONFORMER_COLUMNS: ReadonlySet<ConformerColumn> = new Set([
  'relative',
  'total',
  'forceFieldRelative',
  'forceFieldRank',
]);
