/**
 * The side of a viewer: the panels it offers, whether any of them is open,
 * and what dragging the splitter shut and back open does to them.
 */

import { useMemo } from 'react';

import type { CollapsedPanels } from './useCollapsedPanels.ts';
import { useCollapsedPanels } from './useCollapsedPanels.ts';

/** The side, as a viewer's shell lays it out. */
export interface EditorSide<
  TId extends string,
  TPanel extends { id: string },
> extends CollapsedPanels<TId> {
  /** Every panel on offer, in the order their icons are stacked. */
  panels: readonly TPanel[];
  /** Whether a panel on offer is open, which is whether the side is. */
  isOpen: boolean;
  /**
   * Open or close the side, as the splitter is dragged shut and back open.
   * @param open - Whether the side is now open.
   */
  setOpen: (open: boolean) => void;
}

/**
 * The side of a viewer, from its open panels and the list it offers.
 * @param openPanelIds - The panels the viewer has open.
 * @param togglePanel - Opens or closes one of them.
 * @param panels - Every panel on offer, the host's included; it must keep its
 * identity across renders.
 * @param defaultPanel - The panel dragging the splitter back open lands on.
 * @returns The panels on offer, whether the side is open, and how to open it.
 */
export function useEditorSide<
  TId extends string,
  TPanel extends { id: string },
>(
  openPanelIds: readonly TId[],
  togglePanel: (id: TId) => void,
  panels: readonly TPanel[],
  defaultPanel: TId,
): EditorSide<TId, TPanel> {
  const collapse = useCollapsedPanels<TId>(openPanelIds, togglePanel);
  const { shownIds } = collapse;

  // Read off the panels on offer rather than off the ids: an id no panel
  // answers to opens nothing, and a side open on it alone is an empty column.
  const isOpen = useMemo(() => {
    const open = new Set<string>(shownIds);
    return panels.some((panel) => open.has(panel.id));
  }, [panels, shownIds]);

  /**
   * Open or close the side.
   * @param open - Whether the side is now open.
   */
  function setOpen(open: boolean): void {
    if (!open) {
      for (const panelId of openPanelIds) togglePanel(panelId);
      return;
    }
    // Dragging the splitter back open must land on something, or it opens on
    // an empty column and reads as broken.
    if (!isOpen) togglePanel(defaultPanel);
  }

  return { ...collapse, panels, isOpen, setOpen };
}
