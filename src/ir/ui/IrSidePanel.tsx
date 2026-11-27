import { EditorSidePanels } from '../../panel/ui/EditorSidePanels.tsx';
import type { IrBand } from '../core/irBand.ts';
import type { IrSidePanelId } from '../core/irSidePanels.ts';

import { BandsPanel } from './BandsPanel.tsx';
import { MetadataPanel } from './MetadataPanel.tsx';
import { SpectraPanel } from './SpectraPanel.tsx';
import type { IrSide } from './useIrSide.ts';

export interface IrSidePanelProps {
  /** The side, as `useIrSide` holds it: the host's panels and the viewer's own. */
  side: IrSide;
  /**
   * The band the pointer is resting on.
   * @default null
   */
  highlight?: IrBand | null;
  /**
   * Told when a row is hovered.
   * @default undefined
   */
  onHighlight?: (band: IrBand | null) => void;
}

/**
 * The panels that are open, stacked down the right.
 *
 * Every open panel gets a share of the height rather than a turn, because the
 * things they hold are read together: which spectrum is selected and what its
 * bands are is one question asked of two panels. The header carries the close
 * button and nothing else — a panel's own actions are a toolbar inside its body,
 * so they travel with it.
 *
 * A host's panel is stacked like the viewer's own, and its body is laid out in
 * the same column a built-in panel fills, so it takes its share of the height
 * and scrolls within it rather than pushing the stack.
 * @param props - Component props.
 * @returns The panel stack.
 */
export function IrSidePanel(props: IrSidePanelProps) {
  const { side, highlight = null, onHighlight } = props;

  return (
    <EditorSidePanels
      side={side}
      renderPanel={(panel) => (
        <PanelBody
          panelId={panel.id}
          highlight={highlight}
          onHighlight={onHighlight}
        />
      )}
    />
  );
}

interface PanelBodyProps {
  /** Which panel to draw. */
  panelId: IrSidePanelId;
  /** The band the pointer is resting on. */
  highlight: IrBand | null;
  /** Told when a row is hovered. */
  onHighlight?: (band: IrBand | null) => void;
}

/**
 * Which panel a panel id is.
 * @param props - Component props.
 * @returns The panel's body.
 */
function PanelBody(props: PanelBodyProps) {
  const { panelId, highlight, onHighlight } = props;

  if (panelId === 'spectra') return <SpectraPanel />;
  if (panelId === 'metadata') return <MetadataPanel />;
  return <BandsPanel highlight={highlight} onHighlight={onHighlight} />;
}
