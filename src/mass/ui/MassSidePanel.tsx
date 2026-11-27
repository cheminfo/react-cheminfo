import { EditorSidePanels } from '../../panel/ui/EditorSidePanels.tsx';
import type { MassSidePanelId } from '../core/massSidePanels.ts';

import { MetadataPanel } from './MetadataPanel.tsx';
import { PeaksPanel } from './PeaksPanel.tsx';
import { SpectraPanel } from './SpectraPanel.tsx';
import type { MassSide } from './useMassSide.ts';

export interface MassSidePanelProps {
  /** The side, as `useMassSide` holds it: the host's panels and the viewer's own. */
  side: MassSide;
  /**
   * The m/z of the peak the pointer is resting on.
   * @default null
   */
  highlightMz?: number | null;
  /**
   * Told when a row of the peak table is hovered.
   * @default undefined
   */
  onHighlight?: (mz: number | null) => void;
}

/**
 * The panels that are open, stacked down the right.
 *
 * Every open panel gets a share of the height rather than a turn, because the
 * things they hold are read together: which spectrum is selected and what its
 * peaks are is one question asked of two panels. The header carries the close
 * button and nothing else — a panel's own actions are a toolbar inside its
 * body, so they travel with it.
 * @param props - Component props.
 * @returns The panel stack.
 */
export function MassSidePanel(props: MassSidePanelProps) {
  const { side, highlightMz = null, onHighlight } = props;

  return (
    <EditorSidePanels
      side={side}
      renderPanel={(panel) => (
        <PanelBody
          panelId={panel.id}
          highlightMz={highlightMz}
          {...(onHighlight === undefined ? {} : { onHighlight })}
        />
      )}
    />
  );
}

interface PanelBodyProps {
  /** Which panel to draw. */
  panelId: MassSidePanelId;
  /** The m/z of the peak the pointer is resting on. */
  highlightMz: number | null;
  /**
   * Told when a row of the peak table is hovered.
   * @default undefined
   */
  onHighlight?: (mz: number | null) => void;
}

/**
 * Which panel a panel id is.
 * @param props - Component props.
 * @returns The panel's body.
 */
function PanelBody(props: PanelBodyProps) {
  const { panelId, highlightMz, onHighlight } = props;

  if (panelId === 'spectra') return <SpectraPanel />;
  if (panelId === 'metadata') return <MetadataPanel />;
  return (
    <PeaksPanel
      highlightMz={highlightMz}
      {...(onHighlight === undefined ? {} : { onHighlight })}
    />
  );
}
