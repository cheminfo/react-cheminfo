/**
 * The panels a host adds to the viewer's own, and the one list both make.
 *
 * A host panel is a panel like any other once it is in the list: the activity
 * bar and the stack read the same list, so it toggles, folds and closes
 * exactly as the spectra or the bands do. The host brings the body and nothing
 * else — the header, its close button and the place in the column are the
 * viewer's, which is what keeps every header reading the same.
 */

import type { IconName } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import { irSidePanels } from '../core/irSidePanels.ts';

/** A panel the host adds to the editor's own stack. */
export interface IrHostPanel {
  /**
   * Its identity in the activity bar and in `defaultPanelIds`; never a
   * built-in id. One that is, or that an earlier host panel already took, is
   * left out: one icon cannot open two panels.
   */
  id: string;
  /** What its header and its activity-bar item say. */
  title: string;
  /** Its glyph in the activity bar (a Blueprint IconName). */
  icon: IconName;
  /**
   * Its body. It brings its own toolbar as first row: the header carries the
   * close button only.
   *
   * It is laid out in a column filling the panel's share of the height, so a
   * toolbar row in `panelToolbarStyle` followed by a body in `panelBodyStyle`,
   * both from `react-cheminfo/core`, keeps the toolbar in place while a tall
   * body scrolls under it. It is rendered inside the viewer, so a component in
   * it reaches the viewer it stands in through `useIrEditorState` and
   * `useIrActions` — to overlay a predicted spectrum, say.
   */
  content: ReactNode;
}

/** One panel of the side: one of the viewer's own, or one a host added. */
export type IrStackPanel = (typeof irSidePanels)[number] | IrHostPanel;

/**
 * Every panel the side offers, in the order the activity bar stacks them: the
 * host's first, in the order given, then the viewer's own.
 * @param hostPanels - What the host adds.
 * @returns The panels; the viewer's own list itself when the host adds none.
 */
export function irStackPanels(
  hostPanels: readonly IrHostPanel[],
): readonly IrStackPanel[] {
  if (hostPanels.length === 0) return irSidePanels;
  const taken = new Set<string>(BUILT_IN_IDS);
  const panels: IrStackPanel[] = [];
  for (const panel of hostPanels) {
    if (taken.has(panel.id)) continue;
    taken.add(panel.id);
    panels.push(panel);
  }
  panels.push(...irSidePanels);
  return panels;
}

/**
 * Whether a panel of the side is one a host added, whose body it brings.
 * @param panel - The panel.
 * @returns True for a host's panel.
 */
export function isIrHostPanel(panel: IrStackPanel): panel is IrHostPanel {
  return 'content' in panel;
}

/** The ids no host panel may take. */
const BUILT_IN_IDS: readonly string[] = irSidePanels.map((panel) => panel.id);
