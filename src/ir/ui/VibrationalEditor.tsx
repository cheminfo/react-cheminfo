import type { Ref } from 'react';
import { RootLayout } from 'react-science/ui';

import type { IrEditorHandle, IrPlotClick } from '../core/irEditorApi.ts';
import type { IrPanelId } from '../core/irSidePanels.ts';
import type { IrMode, IrSpectrum } from '../core/irSpectrum.ts';
import type { IrTechnique } from '../core/irTechnique.ts';

import { IrShell } from './IrShell.tsx';
import { IrStateProvider } from './IrStateProvider.tsx';
import type { IrHostPanel } from './irHostPanels.ts';
import { useIrEditor } from './useIrEditor.ts';

export interface VibrationalEditorProps {
  /**
   * What the spectra were measured with. Read when the viewer opens and fixed
   * from then on: it decides the value axes, the direction and name of the
   * wavenumber axis, and whether the correlation table is asked about a band.
   */
  technique: IrTechnique;
  /**
   * The spectra to open on. Read when the viewer opens and never again.
   * @default []
   */
  data?: IrSpectrum[];
  /**
   * Called whenever the spectra open change, with the spectra now open.
   * @default undefined
   */
  onChange?: (spectra: IrSpectrum[]) => void;
  /**
   * Which value axis to open in; one the technique does not offer opens its
   * first instead.
   * @default the technique's first
   */
  mode?: IrMode;
  /**
   * The side panels open to begin with, the viewer's own or the host's. An id
   * no panel answers to is ignored.
   * @default DEFAULT_SIDE_PANELS
   */
  defaultPanelIds?: readonly IrPanelId[];
  /**
   * Panels the host adds to the viewer's own: their icons come first in the
   * activity bar, in the order given, and each behaves as a built-in panel does.
   * @default []
   */
  panels?: readonly IrHostPanel[];
  /**
   * The plot was clicked at this wavenumber (a press that did not travel, i.e.
   * not a zoom drag), with the spectrum selected at that moment.
   * @default undefined
   */
  onPlotClick?: (click: IrPlotClick) => void;
  /**
   * The handle a host drives the viewer through.
   * @default undefined
   */
  ref?: Ref<IrEditorHandle>;
}

/**
 * The viewer `IrEditor` and `RamanEditor` both are: one shell, one set of
 * panels and gestures, with what differs between the techniques read from
 * `IR_TECHNIQUE_RULES` rather than written into either.
 * @param props - Component props.
 * @returns The viewer.
 */
export function VibrationalEditor(props: VibrationalEditorProps) {
  const {
    technique,
    data = NO_SPECTRA,
    onChange,
    mode,
    defaultPanelIds,
    panels = NO_PANELS,
    onPlotClick,
    ref,
  } = props;

  const editor = useIrEditor({
    spectra: data,
    settings: { technique, ...(mode === undefined ? {} : { mode }) },
    panelIds: defaultPanelIds,
    onChange,
  });

  return (
    <IrStateProvider editor={editor}>
      {/* `react-science`'s own root: it holds the element the browser is asked
          to show full screen, points Blueprint's portals at that element so
          dialogs and tooltips are not left behind in `document.body`, and paints
          the backdrop white. Above the shell rather than inside it, so the shell
          can ask whether it is full screen and offer the way out. */}
      <RootLayout style={rootLayoutStyle}>
        <IrShell handle={ref} panels={panels} onPlotClick={onPlotClick} />
      </RootLayout>
    </IrStateProvider>
  );
}

/**
 * The viewer fills what it is given, and its own children scroll rather than
 * push: `react-science` lays its root out as a column of full width and height,
 * and a flex column with no `minHeight` grows past its parent instead.
 */
const rootLayoutStyle = { minHeight: 0 } as const;

/** What a viewer opens on when it is handed nothing, kept stable for the memo. */
const NO_SPECTRA: IrSpectrum[] = [];

/** What a viewer the host adds no panel to offers, kept stable for the memo. */
const NO_PANELS: readonly IrHostPanel[] = [];
