import { useState } from 'react';

/** The filter box of a panel, and the toolbar item that reveals it. */
export interface FilterBox {
  /** What the user typed, empty while nothing is filtered out. */
  filter: string;
  /** Called with what the user typed. */
  setFilter: (filter: string) => void;
  /** Whether the box is showing. */
  showFilter: boolean;
  /** Reveals the box, or hides it and drops what was typed. */
  toggleFilter: () => void;
}

/**
 * A filter box that is out of the way until it is asked for.
 *
 * Closing it drops what was typed, because a box that is out of sight can no
 * longer explain why half the list is missing — which is the one rule every
 * panel offering a filter has to keep, so it is kept here rather than in each
 * of them.
 * @param defaultShowFilter - Whether the box is open to begin with.
 * @returns The state of the box, and the toggle a toolbar item calls.
 */
export function useFilterBox(defaultShowFilter = false): FilterBox {
  const [filter, setFilter] = useState('');
  const [showFilter, setShowFilter] = useState(defaultShowFilter);

  function toggleFilter() {
    if (showFilter) setFilter('');
    setShowFilter(!showFilter);
  }

  return { filter, setFilter, showFilter, toggleFilter };
}
