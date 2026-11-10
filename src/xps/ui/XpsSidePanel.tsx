import { useMemo } from 'react';

import { panelStyle } from '../../panel/core/panelStyles.ts';
import { SidePanelStack } from '../../panel/ui/SidePanelStack.tsx';
import type { CollapsedPanels } from '../../panel/ui/useCollapsedPanels.ts';
import type { XpsPanelId, XpsSidePanelId } from '../core/xpsSidePanels.ts';

import { ComponentsPanel } from './ComponentsPanel.tsx';
import { CompositionPanel } from './CompositionPanel.tsx';
import { ElementsPanel } from './ElementsPanel.tsx';
import { MetadataPanel } from './MetadataPanel.tsx';
import { PeaksPanel } from './PeaksPanel.tsx';
import { SpectraPanel } from './SpectraPanel.tsx';
import type { XpsHostPanel } from './xpsHostPanels.ts';
import { isXpsHostPanel, xpsStackPanels } from './xpsHostPanels.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

export interface XpsSidePanelProps {
  /**
   * What to draw and what closes a panel, for a viewer whose panels may be
   * collapsed.
   * @default every panel the state has open
   */
  side?: Pick<CollapsedPanels<XpsPanelId>, 'shownIds' | 'toggle' | 'folds'>;
  /**
   * The panels the host adds to the viewer's own, stacked above them in the
   * order given.
   * @default []
   */
  panels?: readonly XpsHostPanel[];
}

/**
 * The panels that are open, stacked down the right.
 *
 * Every open panel gets a share of the height rather than a turn: what a
 * spectrum holds and what it is made of are read together, so closing the peak
 * table to see the composition would be a step backwards. The header carries
 * the close button and nothing else — a panel's own actions are a toolbar inside
 * its body, so they travel with it.
 *
 * A host's panel is stacked like the viewer's own, and its body is laid out in
 * the same column a built-in panel fills, so it takes its share of the height
 * and scrolls within it rather than pushing the stack.
 * @param props - Component props.
 * @returns The panel stack.
 */
export function XpsSidePanel(props: XpsSidePanelProps) {
  const { panels: hostPanels = NO_PANELS, side } = props;
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const { openPanelIds } = state.view;
  const panels = useMemo(() => xpsStackPanels(hostPanels), [hostPanels]);

  return (
    <SidePanelStack
      panels={panels}
      openPanelIds={side?.shownIds ?? openPanelIds}
      onClose={side?.toggle ?? actions.togglePanel}
      {...side?.folds}
    >
      {(panel) =>
        isXpsHostPanel(panel) ? (
          <div style={panelStyle}>{panel.content}</div>
        ) : (
          <PanelBody panelId={panel.id} />
        )
      }
    </SidePanelStack>
  );
}

interface PanelBodyProps {
  /** Which panel to draw. */
  panelId: XpsSidePanelId;
}

/**
 * Whichever of the viewer's own panels an id stands for.
 *
 * None of the six takes a prop: each reads the state for itself, which is what
 * lets any of them be mounted somewhere else — a report page, a test — with
 * nothing but a provider above it.
 * @param props - Component props.
 * @returns The panel's body.
 */
function PanelBody(props: PanelBodyProps) {
  const { panelId } = props;

  if (panelId === 'spectra') return <SpectraPanel />;
  if (panelId === 'metadata') return <MetadataPanel />;
  if (panelId === 'peaks') return <PeaksPanel />;
  if (panelId === 'elements') return <ElementsPanel />;
  if (panelId === 'components') return <ComponentsPanel />;
  return <CompositionPanel />;
}

/** What a stack the host adds nothing to holds, kept stable for the memo. */
const NO_PANELS: readonly XpsHostPanel[] = [];
