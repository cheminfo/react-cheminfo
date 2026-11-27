/**
 * The side of the viewer: the panels it offers, whether any of them is open,
 * and what dragging the splitter shut and back open does to them.
 */

import { useMemo } from 'react';

import type { EditorSide } from '../../panel/ui/useEditorSide.ts';
import { useEditorSide } from '../../panel/ui/useEditorSide.ts';
import type { XpsPanelId } from '../core/xpsSidePanels.ts';
import { DEFAULT_SIDE_PANEL } from '../core/xpsState.ts';

import type { XpsHostPanel, XpsStackPanel } from './xpsHostPanels.ts';
import { xpsStackPanels } from './xpsHostPanels.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

/** The side, as the shell lays it out. */
export type XpsSide = EditorSide<XpsPanelId, XpsStackPanel>;

/**
 * The side of the viewer this is called inside.
 * @param hostPanels - The panels the host adds to the viewer's own.
 * @returns The panels on offer, whether the side is open, and how to open it.
 */
export function useXpsSide(hostPanels: readonly XpsHostPanel[]): XpsSide {
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const panels = useMemo(() => xpsStackPanels(hostPanels), [hostPanels]);
  return useEditorSide<XpsPanelId, XpsStackPanel>(
    state.view.openPanelIds,
    actions.togglePanel,
    panels,
    DEFAULT_SIDE_PANEL,
  );
}
