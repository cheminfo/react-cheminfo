/**
 * The two figures a tab and the settings bar both have to know about.
 *
 * The panels of "what differs" and the bars of "how much each explains" are
 * each read twice: once by the figure that draws them, and once by the
 * question mark in the bar, which says in words what the picture says in
 * marks. Building them here means the pair cannot disagree, and that a
 * paragraph quoting `95.8%` is quoting the number the bars were drawn from
 * rather than a second calculation of it.
 */

import { useMemo } from 'react';

import type { MatrixLike } from '../../chart/core/matrix.ts';
import type { ExplainedShares } from '../core/explainedShares.ts';
import { explainedShares } from '../core/explainedShares.ts';
import type { LoadingProfiles } from '../core/loadingProfiles.ts';
import { loadingProfiles } from '../core/loadingProfiles.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ProjectionSamples } from '../core/projectionSamples.ts';

/** What {@link useProjectionModels} needs. */
export interface ProjectionModelsInput {
  /** What the run produced, whatever produced it. */
  result: ProjectionResult;
  /** Who the rows are, for naming the sample a panel rebuilds. */
  samples: ProjectionSamples;
  /** Every option, already made safe against the result. */
  options: ProjectionOptions;
  /** The selected rows, as indices into the score matrix. */
  selected: readonly number[];
}

/** The figures the tabs and the bar share. */
export interface ProjectionModels {
  /**
   * The "what differs" panels, or `null` when the run reported no weights and
   * the tab is not offered at all.
   */
  profiles: LoadingProfiles | null;
  /** The "how much each explains" bars. */
  shares: ExplainedShares;
  /**
   * What the one selected sample is called, which is the only row a panel ever
   * names. With none or several selected it is the row number, so the sentence
   * about it still reads.
   */
  sampleName: string;
}

/**
 * Build both, once per change.
 * @param input - See {@link ProjectionModelsInput}.
 * @returns See {@link ProjectionModels}.
 */
export function useProjectionModels(
  input: ProjectionModelsInput,
): ProjectionModels {
  const { result, samples, options, selected } = input;
  const { loadings, axes, scores } = result;

  const one = selected.length === 1 ? (selected[0] ?? -1) : -1;

  const profiles = useMemo<LoadingProfiles | null>(() => {
    if (loadings === undefined) return null;
    return loadingProfiles({
      loadings,
      axes,
      view: options.variablesView,
      count: options.variablesCount,
      spread: options.spread,
      sharedScale: options.sharedScale,
      order: options.variableOrder,
      sampleScores:
        one < 0 ? undefined : rowScores(scores, one, options.variablesCount),
    });
  }, [loadings, axes, scores, options, one]);

  const shares = useMemo(
    () => explainedShares(axes, { target: options.shareTarget }),
    [axes, options.shareTarget],
  );

  return {
    profiles,
    shares,
    sampleName: samples.ids[one] ?? `Row ${one + 1}`,
  };
}

/**
 * One row of the score matrix, read where it stands.
 * @param scores - Where every sample landed.
 * @param row - Which row.
 * @param count - How many components the panels draw.
 * @returns That sample's scores.
 */
function rowScores(scores: MatrixLike, row: number, count: number): number[] {
  const wanted = Math.max(0, Math.min(count, scores.columns));
  const values = new Array<number>(wanted);
  for (let column = 0; column < wanted; column++) {
    values[column] = scores.get(row, column);
  }
  return values;
}
