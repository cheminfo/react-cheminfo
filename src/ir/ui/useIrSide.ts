/**
 * The side of the viewer: the panels it offers, whether any of them is open,
 * and what dragging the splitter shut and back open does to them.
 */

import { useMemo } from 'react';

import type { EditorSide } from '../../panel/ui/useEditorSide.ts';
import { useEditorSide } from '../../panel/ui/useEditorSide.ts';
import type { IrPanelId } from '../core/irSidePanels.ts';
import { DEFAULT_SIDE_PANEL } from '../core/irState.ts';

import type { IrHostPanel, IrStackPanel } from './irHostPanels.ts';
import { irStackPanels } from './irHostPanels.ts';
import { useIrActions, useIrEditorState } from './irStateContext.ts';

/** The side, as the shell lays it out. */
export type IrSide = EditorSide<IrPanelId, IrStackPanel>;

/**
 * The side of the viewer this is called inside.
 * @param hostPanels - The panels the host adds to the viewer's own.
 * @returns The panels on offer, whether the side is open, and how to open it.
 */
export function useIrSide(hostPanels: readonly IrHostPanel[]): IrSide {
  const { state } = useIrEditorState();
  const actions = useIrActions();
  const panels = useMemo(() => irStackPanels(hostPanels), [hostPanels]);
  return useEditorSide<IrPanelId, IrStackPanel>(
    state.view.openPanelIds,
    actions.togglePanel,
    panels,
    DEFAULT_SIDE_PANEL,
  );
}
