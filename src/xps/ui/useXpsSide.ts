/**
 * The side of the viewer: the panels it offers, whether any of them is open,
 * and what dragging the splitter shut and back open does to them.
 *
 * A hook of its own beside the shell, because the shell lays the side out and
 * this decides what is on it.
 */

import { useMemo } from 'react';

import type { CollapsedPanels } from '../../panel/ui/useCollapsedPanels.ts';
import { useCollapsedPanels } from '../../panel/ui/useCollapsedPanels.ts';
import type { XpsPanelId } from '../core/xpsSidePanels.ts';
import { DEFAULT_SIDE_PANEL } from '../core/xpsState.ts';

import type { XpsHostPanel, XpsStackPanel } from './xpsHostPanels.ts';
import { xpsStackPanels } from './xpsHostPanels.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

/** The side, as the shell lays it out. */
export interface XpsSide extends CollapsedPanels<XpsPanelId> {
  /** Every panel on offer, in the order their icons are stacked. */
  panels: readonly XpsStackPanel[];
  /** Whether a panel on offer is open, which is whether the side is. */
  isOpen: boolean;
  /**
   * Open or close the side, as the splitter is dragged shut and back open.
   * @param open - Whether the side is now open.
   */
  setOpen: (open: boolean) => void;
}

/**
 * The side of the viewer this is called inside.
 * @param hostPanels - The panels the host adds to the viewer's own.
 * @returns The panels on offer, whether the side is open, and how to open it.
 */
export function useXpsSide(hostPanels: readonly XpsHostPanel[]): XpsSide {
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const { openPanelIds } = state.view;
  const collapse = useCollapsedPanels<XpsPanelId>(
    openPanelIds,
    actions.togglePanel,
  );
  const { shownIds } = collapse;

  const panels = useMemo(() => xpsStackPanels(hostPanels), [hostPanels]);
  // Read off the panels on offer rather than off the ids: an id no panel
  // answers to opens nothing, and a side open on it alone is an empty column.
  const isOpen = panels.some((panel) => shownIds.includes(panel.id));

  /**
   * Open or close the side.
   * @param open - Whether the side is now open.
   */
  function setOpen(open: boolean): void {
    if (!open) {
      for (const panelId of openPanelIds) actions.togglePanel(panelId);
      return;
    }
    // Dragging the splitter back open must land on something, or it opens on
    // an empty column and reads as broken.
    if (!isOpen) actions.togglePanel(DEFAULT_SIDE_PANEL);
  }

  return { ...collapse, panels, isOpen, setOpen };
}
