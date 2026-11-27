import { EditorSidePanels } from '../../panel/ui/EditorSidePanels.tsx';
import type { XpsSidePanelId } from '../core/xpsSidePanels.ts';

import { ComponentsPanel } from './ComponentsPanel.tsx';
import { CompositionPanel } from './CompositionPanel.tsx';
import { ElementsPanel } from './ElementsPanel.tsx';
import { MetadataPanel } from './MetadataPanel.tsx';
import { PeaksPanel } from './PeaksPanel.tsx';
import { QuantificationPanel } from './QuantificationPanel.tsx';
import { SpectraPanel } from './SpectraPanel.tsx';
import type { XpsSide } from './useXpsSide.ts';

export interface XpsSidePanelProps {
  /** The side, as `useXpsSide` holds it: the host's panels and the viewer's own. */
  side: XpsSide;
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
  const { side } = props;

  return (
    <EditorSidePanels
      side={side}
      renderPanel={(panel) => <PanelBody panelId={panel.id} />}
    />
  );
}

interface PanelBodyProps {
  /** Which panel to draw. */
  panelId: XpsSidePanelId;
}

/**
 * Whichever of the viewer's own panels an id stands for.
 *
 * None of the seven takes a prop: each reads the state for itself, which is what
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
  if (panelId === 'quantification') return <QuantificationPanel />;
  if (panelId === 'components') return <ComponentsPanel />;
  return <CompositionPanel />;
}
