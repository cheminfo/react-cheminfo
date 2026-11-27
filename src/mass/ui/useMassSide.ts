/**
 * The side of the viewer: the panels it offers, whether any of them is open,
 * and what dragging the splitter shut and back open does to them.
 */

import { useMemo } from 'react';

import type { EditorSide } from '../../panel/ui/useEditorSide.ts';
import { useEditorSide } from '../../panel/ui/useEditorSide.ts';
import type { MassPanelId } from '../core/massSidePanels.ts';
import { DEFAULT_SIDE_PANEL } from '../core/massState.ts';

import type { MassHostPanel, MassStackPanel } from './massHostPanels.ts';
import { massStackPanels } from './massHostPanels.ts';
import { useMassActions, useMassEditorState } from './massStateContext.ts';

/** The side, as the shell lays it out. */
export type MassSide = EditorSide<MassPanelId, MassStackPanel>;

/**
 * The side of the viewer this is called inside.
 * @param hostPanels - The panels the host adds to the viewer's own.
 * @returns The panels on offer, whether the side is open, and how to open it.
 */
export function useMassSide(hostPanels: readonly MassHostPanel[]): MassSide {
  const { state } = useMassEditorState();
  const actions = useMassActions();
  const panels = useMemo(() => massStackPanels(hostPanels), [hostPanels]);
  return useEditorSide<MassPanelId, MassStackPanel>(
    state.view.openPanelIds,
    actions.togglePanel,
    panels,
    DEFAULT_SIDE_PANEL,
  );
}
