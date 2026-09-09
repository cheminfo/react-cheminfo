import { useCallback, useMemo, useState } from 'react';

import type { ScatterSelectionMode } from '../core/scatterSelection.ts';
import {
  mergeScatterSelection,
  scatterSelectedIndices,
  scatterSelectionMask,
} from '../core/scatterSelection.ts';

/** What a gesture did to a scatter's selection. */
export interface SelectionChange {
  /** The selected rows, ascending, as indices into the arrays the caller passed. */
  indices: readonly number[];
  /** Whether the gesture replaced the previous selection, added to it, or cut from it. */
  mode: ScatterSelectionMode;
  /** Which gesture produced it. */
  source: 'lasso' | 'point' | 'keyboard' | 'clear' | 'all';
}

/** What {@link useScatterSelection} needs. */
export interface ScatterSelectionOptions {
  /** How many points the cloud holds. */
  count: number;
  /**
   * The selected rows when the caller owns them. Present, it wins over
   * anything the reader has done here — see {@link useScatterSelection} for
   * what that means for a caller that stops passing it.
   * @default undefined — the hook keeps the selection itself
   */
  selected?: readonly number[];
  /**
   * The rows selected before the reader touches anything, for the uncontrolled
   * case. It is read once; changing it later moves nothing.
   * @default undefined — nothing is selected
   */
  defaultSelected?: readonly number[];
  /**
   * Called once per settled gesture, never while a lasso is being drawn.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
}

/** A scatter's selection, and the four ways a gesture changes it. */
export interface ScatterSelectionApi {
  /**
   * One entry per point, `1` for selected. It includes whatever a lasso is
   * currently previewing, so the dots under a half-drawn ring already look
   * picked.
   */
  mask: Uint8Array;
  /** The same, as ascending indices. */
  indices: number[];
  /** How many points that is, without walking the list again. */
  selectedCount: number;
  /** Whether a lasso is showing what it would do rather than having done it. */
  previewing: boolean;
  /** Settle a new selection from a list of rows. */
  select: (
    rows: Iterable<number>,
    mode?: ScatterSelectionMode,
    source?: SelectionChange['source'],
  ) => void;
  /** Settle one from a mask, which is the shape a lasso hands back. */
  selectMask: (
    hits: Uint8Array,
    mode?: ScatterSelectionMode,
    source?: SelectionChange['source'],
  ) => void;
  /** Show what a gesture would do without settling it; `null` clears it. */
  preview: (hits: Uint8Array | null, mode?: ScatterSelectionMode) => void;
  /** Empty the selection. */
  clear: () => void;
  /** Select every point. */
  selectAll: () => void;
}

/**
 * The set of points a scatter has picked out, controlled or not.
 *
 * A caller may own the selection and pass it back through `selected`, or leave
 * it here and only listen. Both work through one hook, and the controlled
 * value wins on every render: a parent that answers a change by passing
 * something else — a filter that keeps only the rows still on screen — sees
 * what it asked for and not what the gesture asked for. The hook keeps its own
 * copy up to date all the same, so a caller that stops passing `selected`
 * carries on from where the reader left off rather than from nothing.
 *
 * A preview is deliberately not a change. What a half-drawn lasso would catch
 * is merged in for the render and never reported, which is what lets a
 * controlled parent stay out of a drag it would otherwise be re-rendered by
 * sixty times a second.
 * @param options - See {@link ScatterSelectionOptions}.
 * @returns The selection. See {@link ScatterSelectionApi}.
 */
export function useScatterSelection(
  options: ScatterSelectionOptions,
): ScatterSelectionApi {
  const { count, selected, defaultSelected, onSelectionChange } = options;

  const [own, setOwn] = useState<readonly number[]>(defaultSelected ?? EMPTY);
  const [draft, setDraft] = useState<SelectionDraft | null>(null);
  const committed = selected ?? own;

  const mask = useMemo(() => {
    const base = scatterSelectionMask(committed, count);
    if (draft === null) return base;
    return mergeScatterSelection(base, draft.hits, draft.mode, base);
  }, [committed, count, draft]);

  const indices = useMemo(() => scatterSelectedIndices(mask), [mask]);

  const commit = useCallback(
    (
      rows: number[],
      mode: ScatterSelectionMode,
      source: SelectionChange['source'],
    ) => {
      setDraft(null);
      setOwn(rows);
      onSelectionChange?.({ indices: rows, mode, source });
    },
    [onSelectionChange],
  );

  const selectMask = useCallback(
    (
      hits: Uint8Array,
      mode: ScatterSelectionMode = 'replace',
      source: SelectionChange['source'] = 'lasso',
    ) => {
      const base = scatterSelectionMask(committed, count);
      const merged = mergeScatterSelection(base, hits, mode, base);
      commit(scatterSelectedIndices(merged), mode, source);
    },
    [commit, committed, count],
  );

  const select = useCallback(
    (
      rows: Iterable<number>,
      mode: ScatterSelectionMode = 'replace',
      source: SelectionChange['source'] = 'point',
    ) => {
      selectMask(scatterSelectionMask(rows, count), mode, source);
    },
    [count, selectMask],
  );

  const preview = useCallback(
    (hits: Uint8Array | null, mode: ScatterSelectionMode = 'replace') => {
      setDraft(hits === null ? null : { hits, mode });
    },
    [],
  );

  const clear = useCallback(() => {
    commit([], 'replace', 'clear');
  }, [commit]);

  const selectAll = useCallback(() => {
    const rows = new Array<number>(Math.max(0, count));
    for (let index = 0; index < rows.length; index++) rows[index] = index;
    commit(rows, 'replace', 'all');
  }, [commit, count]);

  return {
    mask,
    indices,
    selectedCount: indices.length,
    previewing: draft !== null,
    select,
    selectMask,
    preview,
    clear,
    selectAll,
  };
}

/** Shared, so an uncontrolled scatter with nothing picked allocates nothing. */
const EMPTY: readonly number[] = [];

/** What a lasso is showing it would do, before it has been released. */
interface SelectionDraft {
  /** The points the half-drawn gesture is over. */
  hits: Uint8Array;
  /** What releasing would do with them. */
  mode: ScatterSelectionMode;
}
