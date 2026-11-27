/**
 * The panels a host adds to the IR viewer's own: the family's host panel,
 * stacked by `stackPanels` above the viewer's own.
 */

import type { EditorHostPanel } from '../../panel/ui/hostPanels.ts';
import { stackPanels } from '../../panel/ui/hostPanels.ts';
import { irSidePanels } from '../core/irSidePanels.ts';

/**
 * A panel the host adds to the viewer's own stack. It is rendered inside the
 * viewer, so a component in it reaches the viewer it stands in through
 * `useIrEditorState` and `useIrActions` — to overlay a predicted spectrum, say.
 */
export type IrHostPanel = EditorHostPanel;

/** One panel of the side: one of the viewer's own, or one a host added. */
export type IrStackPanel = (typeof irSidePanels)[number] | IrHostPanel;

/**
 * Every panel the side offers: the host's first, in the order given, then the
 * viewer's own.
 * @param hostPanels - What the host adds.
 * @returns The panels; the viewer's own list itself when the host adds none.
 */
export function irStackPanels(
  hostPanels: readonly IrHostPanel[],
): readonly IrStackPanel[] {
  return stackPanels(irSidePanels, hostPanels);
}

/** Whether a panel of the side is one a host added, whose body it brings. */

export { isHostPanel as isIrHostPanel } from '../../panel/ui/hostPanels.ts';
