import { useEffect, useState } from 'react';

import {
  readPanelsCollapsed,
  watchPanelsCollapsed,
} from '../core/panelsCollapsed.ts';

/** What {@link useCollapsedPanels} hands an editor. */
export interface CollapsedPanels<TId extends string> {
  /** Whether the window has no room for the panels beside the figure. */
  collapsed: boolean;
  /** What the stack draws and the rail lights. */
  shownIds: readonly TId[];
  /**
   * What a press on the rail and the cross do.
   * @param id - The panel.
   */
  toggle: (id: TId) => void;
  /** Spread on `<SidePanelStack>`: alone over the figure, a fold sends it away. */
  folds: {
    foldedPanelIds?: readonly string[];
    onFoldedPanelIdsChange?: (ids: string[]) => void;
  };
}

/**
 * The panels of an editor that keeps them in React state, as `<PanelRow>` asks
 * them to be kept: with no room, one at a time over the figure, and what is open
 * left as it was so a wider window finds it.
 * @param openIds - The panels the editor has open.
 * @param onToggle - Opens or closes one of them.
 * @returns What to draw, and what a press does.
 */
export function useCollapsedPanels<TId extends string>(
  openIds: readonly TId[],
  onToggle: (id: TId) => void,
): CollapsedPanels<TId> {
  const [collapsed, setCollapsed] = useState(readPanelsCollapsed);
  const [onShow, setOnShow] = useState<TId | null>(null);

  useEffect(
    () =>
      watchPanelsCollapsed((next) => {
        setCollapsed(next);
        setOnShow(null);
        // What was on screen stays on screen when there is room for it again.
        if (!next && onShow !== null && !openIds.includes(onShow)) {
          onToggle(onShow);
        }
      }),
    [onShow, openIds, onToggle],
  );

  if (!collapsed) {
    return { collapsed, shownIds: openIds, toggle: onToggle, folds: {} };
  }
  return {
    collapsed,
    shownIds: onShow === null ? [] : [onShow],
    toggle: (id) => {
      setOnShow(onShow === id ? null : id);
    },
    folds: {
      foldedPanelIds: [],
      onFoldedPanelIdsChange: (ids) => {
        if (ids.length > 0) setOnShow(null);
      },
    },
  };
}
