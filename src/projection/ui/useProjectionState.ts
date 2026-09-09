import { useCallback, useMemo, useState } from 'react';

import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { SelectionChange } from '../../scatter/ui/useScatterSelection.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import { resolveProjectionOptions } from '../core/projectionOptions.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';
import { resolveProjectionGroups } from '../core/projectionSamples.ts';
import type { ProjectionTab } from '../core/projectionTabs.ts';
import { projectionTabs } from '../core/projectionTabs.ts';

import type { ProjectionSelection } from './projectionSelection.ts';
import {
  indexProjectionIds,
  projectionNamesOf,
  projectionRowsOf,
} from './projectionSelection.ts';
import type { ProjectionViewerProps } from './projectionViewerProps.ts';

/**
 * What {@link useProjectionState} needs: the run, the rows, and the three
 * pieces of state a caller may take over.
 *
 * It is the viewer's own props narrowed rather than a second list of the same
 * eleven fields, so a default documented on the component is the default the
 * hook actually applies and the two cannot drift apart.
 */
export type ProjectionStateOptions = Pick<
  ProjectionViewerProps,
  | 'result'
  | 'samples'
  | 'tab'
  | 'defaultTab'
  | 'onTabChange'
  | 'selected'
  | 'defaultSelected'
  | 'onSelectionChange'
  | 'options'
  | 'panels'
  | 'defaultOptions'
  | 'onOptionsChange'
>;

/** What every tab reads, and the five ways any of them changes it. */
export interface ProjectionStateApi {
  /** The tabs this result can fill, in reading order. */
  tabs: readonly ProjectionTab[];
  /** The one showing. */
  tab: ProjectionTab;
  /** Move to another tab. One the result cannot fill is ignored. */
  setTab: (tab: ProjectionTab) => void;
  /** The groups as every figure draws them, resolved once per change. */
  groups: ResolvedProjectionGroups;
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

/**
 * The tab, the pair of axes, the selection and the options, controlled or not.
 *
 * The tabs are one tool only while they agree, which is why this is one hook
 * and not four pieces of state in the shell: a pair promoted from the grid has
 * to arrive on the map, and a lasso drawn there has to still be selected when
 * the reader comes back to it.
 *
 * Each of tab, selection and options is owned by the caller from the moment
 * its prop is passed and by the hook otherwise, and the two are never mixed: a
 * controlled value wins on every render, so a caller told about a change that
 * does not pass the new value back sees the figure stay where it was, rather
 * than drift out of step with the address bar it is driven from. A `default`
 * is read once, when the viewer mounts, and changing it later moves nothing.
 *
 * Selections cross this boundary as names rather than row numbers. A caller
 * lighting up its own table already holds the names; handing back indices
 * would make it keep a second copy of the row order, and that copy is exactly
 * what goes stale the first time the data behind it is filtered.
 * @param options - See {@link ProjectionStateOptions}.
 * @returns The shared state. See {@link ProjectionStateApi}.
 */
export function useProjectionState(
  options: ProjectionStateOptions,
): ProjectionStateApi {
  const {
    result,
    samples,
    tab,
    defaultTab,
    onTabChange,
    selected,
    defaultSelected,
    onSelectionChange,
    options: heldOptions,
    defaultOptions,
    onOptionsChange,
    panels,
  } = options;

  const { ids } = samples;
  const tabs = useMemo(() => projectionTabs(result, panels), [result, panels]);
  const rowOfId = useMemo(() => indexProjectionIds(ids), [ids]);

  const [ownTab, setOwnTab] = useState<ProjectionTab | undefined>(defaultTab);
  const [ownSelected, setOwnSelected] = useState<readonly number[]>(() =>
    projectionRowsOf(defaultSelected, rowOfId),
  );
  const [ownOptions, setOwnOptions] = useState<Partial<ProjectionOptions>>(
    () => defaultOptions ?? {},
  );

  const groups = useMemo(
    () => resolveProjectionGroups(samples, result.scores.rows),
    [result, samples],
  );
  const settled = useMemo(
    () => resolveProjectionOptions(heldOptions ?? ownOptions, result),
    [heldOptions, ownOptions, result],
  );

  const setTab = useCallback(
    (wanted: ProjectionTab) => {
      const reachable = inReach(wanted, tabs);
      if (reachable === undefined) return;
      if (tab === undefined) setOwnTab(reachable);
      onTabChange?.(reachable);
    },
    [onTabChange, tab, tabs],
  );

  const setOptions = useCallback(
    (patch: Partial<ProjectionOptions>) => {
      const next = resolveProjectionOptions({ ...settled, ...patch }, result);
      if (heldOptions === undefined) setOwnOptions(next);
      onOptionsChange?.(next);
    },
    [heldOptions, onOptionsChange, result, settled],
  );

  const selectRows = useCallback(
    (
      rows: readonly number[],
      mode: ScatterSelectionMode,
      source: ProjectionSelection['source'],
    ) => {
      if (selected === undefined) setOwnSelected(rows);
      onSelectionChange?.({
        ids: projectionNamesOf(rows, ids),
        indices: rows,
        mode,
        source,
      });
    },
    [ids, onSelectionChange, selected],
  );

  const settleSelection = useCallback(
    (change: SelectionChange) => {
      selectRows(change.indices, change.mode, change.source);
    },
    [selectRows],
  );

  const selectPair = useCallback(
    (xAxis: number, yAxis: number) => {
      setOptions({ xAxis, yAxis });
      setTab('map');
    },
    [setOptions, setTab],
  );

  return {
    tabs,
    // The last resort is the first tab offered, never the map: a site that
    // narrowed `panels` away from it would otherwise be shown the one panel it
    // said it had no room for, under a strip that does not name it.
    tab: inReach(tab, tabs) ?? inReach(ownTab, tabs) ?? tabs[0] ?? 'map',
    setTab,
    groups,
    options: settled,
    setOptions,
    selected:
      selected === undefined
        ? ownSelected
        : projectionRowsOf(selected, rowOfId),
    settleSelection,
    selectRows,
    selectPair,
  };
}

/**
 * The wanted tab, when the result can actually fill it.
 *
 * A saved tab outlives the data it was saved on: a page reopening on the
 * shares tab and handed a UMAP would otherwise show an empty panel with no
 * obvious way back, so an unreachable tab is answered with nothing and the
 * caller falls through to the first tab there is.
 * @param wanted - The tab asked for, if any.
 * @param tabs - The tabs the result can fill.
 * @returns The tab, or `undefined` when it is not one of them.
 */
function inReach(
  wanted: ProjectionTab | undefined,
  tabs: readonly ProjectionTab[],
): ProjectionTab | undefined {
  if (wanted === undefined) return undefined;
  for (const tab of tabs) {
    if (tab === wanted) return wanted;
  }
  return undefined;
}
