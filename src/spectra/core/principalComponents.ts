import type { PCAOptions } from 'ml-pca';

/**
 * How the principal components are computed.
 *
 * `spectra-processor` hands out the normalized matrix and stops there, so the
 * decomposition is the consumer's `new PCA(matrix, options)` call — these are
 * that call's options, read off `ml-pca` rather than retyped.
 */
export type PrincipalComponentSettings = Omit<PCAOptions, 'isCovarianceMatrix'>;

/**
 * Which two components a score plot is drawn against.
 *
 * Both are columns of the score matrix, counting from zero: `PC1` is `0`. The
 * labels say `PC1` because that is what a chemist writes; the numbers stay
 * zero-based because that is what indexes the matrix.
 */
export interface PrincipalComponentSelection {
  /** The component along x — `0` is `PC1`. */
  x: number;
  /** The component along y — `1` is `PC2`. */
  y: number;
}

/** The first two components, which is what a score plot opens on. */
export const DEFAULT_PRINCIPAL_COMPONENTS: PrincipalComponentSelection = {
  x: 0,
  y: 1,
};

/** How `ml-pca` may be asked to decompose the matrix. */
export const PCA_METHODS: ReadonlyArray<{
  value: NonNullable<PCAOptions['method']>;
  label: string;
}> = [
  { value: 'SVD', label: 'Singular value decomposition' },
  { value: 'NIPALS', label: 'NIPALS' },
  { value: 'covarianceMatrix', label: 'Covariance matrix' },
];

/**
 * What one component is called, with the share of the variance it carries.
 * @param index - The component, counting from zero.
 * @param explainedVariance - What `pca.getExplainedVariance()` returned, as fractions.
 * @returns For instance `PC1 — 74.2 %`, or just `PC1` when no variance is known.
 */
export function principalComponentLabel(
  index: number,
  explainedVariance?: readonly number[],
): string {
  const name = `PC${String(index + 1)}`;
  const share = explainedVariance?.[index];
  if (share === undefined || !Number.isFinite(share)) return name;
  return `${name} — ${(share * 100).toFixed(1)} %`;
}

/**
 * Every component that can be picked, in order.
 *
 * A component nobody can read is worse than none, so the share of the variance
 * travels with the label: a reader picking `PC7 — 0.3 %` can see they are about
 * to plot noise.
 * @param count - How many components the decomposition produced.
 * @param explainedVariance - What `pca.getExplainedVariance()` returned.
 * @returns The choices, one per component.
 */
export function principalComponentChoices(
  count: number,
  explainedVariance?: readonly number[],
): ReadonlyArray<{ index: number; label: string }> {
  const choices: Array<{ index: number; label: string }> = [];
  for (let index = 0; index < count; index++) {
    choices.push({
      index,
      label: principalComponentLabel(index, explainedVariance),
    });
  }
  return choices;
}

/**
 * The selection made safe against the decomposition that actually came back.
 *
 * A saved selection outlives the data it was made on: reload with fewer spectra
 * and `PC8` no longer exists. Rather than let a plot ask for a column that is
 * not there, the pair is pulled back inside what was computed, and the two axes
 * are kept apart so the plot never collapses onto its diagonal.
 * @param selection - What the reader picked, possibly on other data.
 * @param count - How many components the decomposition produced.
 * @returns A selection both of whose components exist.
 */
export function clampPrincipalComponents(
  selection: PrincipalComponentSelection,
  count: number,
): PrincipalComponentSelection {
  if (count < 1) return { x: 0, y: 0 };
  const last = count - 1;
  const x = clamp(selection.x, last);
  let y = clamp(selection.y, last);
  if (y === x && count > 1) y = x === 0 ? 1 : x - 1;
  return { x, y };
}

/**
 * The share of the variance the two picked components carry together.
 * @param selection - Which components are drawn.
 * @param explainedVariance - What `pca.getExplainedVariance()` returned.
 * @returns The sum as a fraction, or undefined when either share is unknown.
 */
export function selectedExplainedVariance(
  selection: PrincipalComponentSelection,
  explainedVariance: readonly number[],
): number | undefined {
  const along = explainedVariance[selection.x];
  const up = explainedVariance[selection.y];
  if (along === undefined || up === undefined) return undefined;
  return along + up;
}

/**
 * A component index brought inside the components that exist.
 * @param index - What was asked for.
 * @param last - The highest component there is.
 * @returns A whole number between zero and `last`.
 */
function clamp(index: number, last: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.round(index), 0), last);
}
