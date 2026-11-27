/**
 * The panels of a viewer that are open, stacked down the right: its own and
 * the ones a host added, in the one list the side offers.
 */

import type { ReactElement, ReactNode } from 'react';

import { panelStyle } from '../core/panelStyles.ts';

import type { PanelDescriptor } from './SidePanelStack.tsx';
import { SidePanelStack } from './SidePanelStack.tsx';
import type { EditorHostPanel } from './hostPanels.ts';
import { isHostPanel } from './hostPanels.ts';
import type { EditorSide } from './useEditorSide.ts';

/** Props of {@link EditorSidePanels}. */
export interface EditorSidePanelsProps<TPanel extends PanelDescriptor> {
  /** The side, as `useEditorSide` holds it: what is on offer and what is shown. */
  side: Pick<
    EditorSide<string, TPanel | EditorHostPanel>,
    'panels' | 'shownIds' | 'toggle' | 'folds'
  >;
  /**
   * The body of one of the viewer's own panels.
   * @param panel - The panel.
   * @returns Its body.
   */
  renderPanel: (panel: TPanel) => ReactNode;
}

/**
 * Every open panel gets a share of the height rather than a turn, because the
 * things they hold are read together. The header carries the close button and
 * nothing else — a panel's own actions are a toolbar inside its body, so they
 * travel with it. A host's panel is laid out in the same column a built-in
 * panel fills, so it takes its share of the height and scrolls within it
 * rather than pushing the stack.
 * @param props - See {@link EditorSidePanelsProps}.
 * @returns The panel stack.
 */
export function EditorSidePanels<TPanel extends PanelDescriptor>(
  props: EditorSidePanelsProps<TPanel>,
): ReactElement {
  const { side, renderPanel } = props;
  return (
    <SidePanelStack
      panels={side.panels}
      openPanelIds={side.shownIds}
      onClose={side.toggle}
      {...side.folds}
    >
      {(panel) =>
        isHostPanel(panel) ? (
          <div style={panelStyle}>{panel.content}</div>
        ) : (
          renderPanel(panel)
        )
      }
    </SidePanelStack>
  );
}
