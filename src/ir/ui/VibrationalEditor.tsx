import type { ReactNode, Ref } from 'react';
import { RootLayout } from 'react-science/ui';

import type { IrEditorHandle, IrPlotClick } from '../core/irEditorApi.ts';
import type { IrPanelId } from '../core/irSidePanels.ts';
import type { IrMode, IrSpectrum } from '../core/irSpectrum.ts';
import type { IrTechnique } from '../core/irTechnique.ts';

import { IrShell } from './IrShell.tsx';
import { IrStateProvider } from './IrStateProvider.tsx';
import type { IrHostPanel } from './irHostPanels.ts';
import { useIrEditor } from './useIrEditor.ts';

/**
 * What every viewer of this family takes — infrared, Raman, UV-vis and
 * fluorescence — the position on the chart being a wavenumber, a Raman shift
 * or a wavelength, always held and reported as `wavenumber`.
 */
export interface SpectrumViewerProps {
  /**
   * The spectra to open on. Read when the viewer opens and never again: what is
   * on the chart belongs to the viewer from then on, so a host re-rendering with
   * another array does not silently replace what somebody is looking at. The
   * `ref` handle is how spectra arrive afterwards.
   * @default []
   */
  data?: IrSpectrum[];
  /**
   * Called whenever the spectra open change — one loaded, one closed, the chart
   * cleared, the bands of one picked — with the spectra now open, each carrying
   * its bands.
   *
   * The document only. A zoom, a selection, a rename and a colour change what is
   * being looked at rather than what is loaded, and a host told about those would
   * be told on every drag of the mouse.
   * @default undefined
   */
  onChange?: (spectra: IrSpectrum[]) => void;
  /**
   * Whether the Bands panel says what each band could be. An exercise switches
   * it off, so the reading of the bands is the student's; the table's ranges
   * can still be offered to look up, in a panel of the host's.
   * @default true
   */
  assignments?: boolean;
  /**
   * Which value axis to open in; one the technique does not offer opens its
   * first instead.
   * @default the technique's first
   */
  mode?: IrMode;
  /**
   * The side panels open to begin with: the viewer's own — `'spectra'`,
   * `'bands'`, `'metadata'` — or the id of one of `panels`. An id no panel
   * answers to is ignored.
   * @default DEFAULT_SIDE_PANELS
   */
  defaultPanelIds?: readonly IrPanelId[];
  /**
   * Panels the host adds to the viewer's own — a structure to predict a
   * spectrum from, say. Their icons come first in the activity bar, in the
   * order given, and each then behaves as a built-in panel does: toggled on its
   * own, stacked in the same column with a share of its height, folded and
   * closed from its header.
   * @default []
   */
  panels?: readonly IrHostPanel[];
  /**
   * The plot was clicked at this position (a press that did not travel, i.e.
   * not a zoom drag), with the spectrum selected at that moment. Not called
   * while bands are picked by hand: a click is a band then.
   * @default undefined
   */
  onPlotClick?: (click: IrPlotClick) => void;
  /**
   * The host's own actions on what it keeps — open a file, save a document —
   * as `Toolbar.Item`s of `react-science/ui`, drawn in the header after the
   * viewer's mark.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * The handle a host drives the viewer through: take these spectra, frame this
   * position, select that one.
   * @default undefined
   */
  ref?: Ref<IrEditorHandle>;
}

/** What the viewer of one technique takes: the shared props, and the technique. */
export interface VibrationalEditorProps extends SpectrumViewerProps {
  /**
   * What the spectra were measured with. Read when the viewer opens and fixed
   * from then on: it decides the value axes, the direction and name of the
   * wavenumber axis, and whether the correlation table is asked about a band.
   */
  technique: IrTechnique;
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
    assignments,
    mode,
    defaultPanelIds,
    panels = NO_PANELS,
    onPlotClick,
    actions,
    ref,
  } = props;

  const editor = useIrEditor({
    spectra: data,
    settings: { technique, ...(mode === undefined ? {} : { mode }) },
    panelIds: defaultPanelIds,
    onChange,
    assignments,
  });

  return (
    <IrStateProvider editor={editor}>
      {/* `react-science`'s own root: it holds the element the browser is asked
          to show full screen, points Blueprint's portals at that element so
          dialogs and tooltips are not left behind in `document.body`, and paints
          the backdrop white. Above the shell rather than inside it, so the shell
          can ask whether it is full screen and offer the way out. */}
      <RootLayout style={rootLayoutStyle}>
        <IrShell
          handle={ref}
          panels={panels}
          onPlotClick={onPlotClick}
          actions={actions}
        />
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
