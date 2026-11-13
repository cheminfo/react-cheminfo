import { createContext, useContext, useEffect, useId } from 'react';

import { filterNeedle } from '../core/textFilter.ts';

/** What one part of a panel lists: the rows kept, of its rows. */
export interface PanelTally {
  /** The rows the search and the filters keep. */
  shown: number;
  /** Every row the part holds. */
  total: number;
}

/** What a `<PanelSearch>` shares with its box, its count and its lists. */
export interface PanelSearchState {
  /** What is typed in the box. */
  filter: string;
  /** Changes what is typed. */
  setFilter: (filter: string) => void;
  /** Takes a list's tally, or drops it with `null`. */
  report: (key: string, tally: PanelTally | null) => void;
  /** Every list's tally, by the list's key. */
  tallies: ReadonlyMap<string, PanelTally>;
}

/** The `<PanelSearch>` around a part, or `null` outside one. */
export const PanelSearchContext = createContext<PanelSearchState | null>(null);

/**
 * What the panel's search box asks for.
 * @returns The needle, `''` when nothing is searched for or outside a
 * `<PanelSearch>`.
 */
export function usePanelNeedle(): string {
  const search = useContext(PanelSearchContext);
  return search ? filterNeedle(search.filter) : '';
}

/**
 * Count a list's rows into the `<PanelSearch>` around it, whose
 * `<PanelCount>` shows the panel's total. Outside one it does nothing.
 * @param shown - The rows the list shows.
 * @param total - Every row it holds.
 */
export function usePanelTally(shown: number, total: number): void {
  const report = useContext(PanelSearchContext)?.report;
  const key = useId();
  useEffect(() => {
    if (!report) return;
    report(key, { shown, total });
    return () => {
      report(key, null);
    };
  }, [report, key, shown, total]);
}

/**
 * The tallies with one list's replaced, the same map when nothing changed.
 * @param tallies - The tallies so far.
 * @param key - The list.
 * @param tally - Its tally, `null` when it is gone.
 * @returns The tallies.
 */
export function withTally(
  tallies: ReadonlyMap<string, PanelTally>,
  key: string,
  tally: PanelTally | null,
): ReadonlyMap<string, PanelTally> {
  const previous = tallies.get(key);
  if (tally === null) {
    if (!previous) return tallies;
    const next = new Map(tallies);
    next.delete(key);
    return next;
  }
  if (previous?.shown === tally.shown && previous.total === tally.total) {
    return tallies;
  }
  return new Map(tallies).set(key, tally);
}
