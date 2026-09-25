/**
 * What the one hook every tab shares hands out.
 *
 * The type lives beside the hook rather than inside it because the hook is
 * short and its answer is not: a reader looking for how the state is kept
 * should not have to scroll past a page of documented fields to find it.
 */

import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { SelectionChange } from '../../scatter/ui/useScatterSelection.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type {
  ProjectionGrouping,
  ResolvedProjectionGroups,
  ResolvedProjectionShapes,
} from '../core/projectionSamples.ts';
import type { ProjectionTab } from '../core/projectionTabs.ts';

import type { ProjectionSelection } from './projectionSelection.ts';

/** What every tab reads, and the five ways any of them changes it. */
export interface ProjectionStateApi {
  /** The tabs this result can fill, in reading order. */
  tabs: readonly ProjectionTab[];
  /** The one showing. */
  tab: ProjectionTab;
  /** Move to another tab. One the result cannot fill is ignored. */
  setTab: (tab: ProjectionTab) => void;
  /**
   * The grouping the dots are coloured by, resolved once per change; empty
   * while the colour stands for nothing.
   */
  groups: ResolvedProjectionGroups;
  /**
   * The grouping the dots are shaped by, resolved once per change, or `null`
   * while they are all discs.
   */
  shapes: ResolvedProjectionShapes | null;
  /** Every grouping the samples carry, for the pickers that choose between them. */
  groupings: readonly ProjectionGrouping[];
  /** Every option, already made safe against the result. */
  options: ProjectionOptions;
  /** Change some of them; the rest are carried over and checked again. */
  setOptions: (patch: Partial<ProjectionOptions>) => void;
  /** The selected rows, as indices, which is what a plot draws. */
  selected: readonly number[];
  /** Settle a selection a plot's own gesture produced. */
  settleSelection: (change: SelectionChange) => void;
  /** Settle one from elsewhere — a legend entry, a table beside the figure. */
  selectRows: (
    rows: readonly number[],
    mode: ScatterSelectionMode,
    source: ProjectionSelection['source'],
  ) => void;
  /** Draw one pair of axes on the map, which is what a cell of the grid does. */
  selectPair: (xAxis: number, yAxis: number) => void;
}
