import type { Ref } from 'react';
import { RootLayout } from 'react-science/ui';

import type { IrEditorHandle } from '../core/irEditorApi.ts';
import type { IrSidePanelId } from '../core/irSidePanels.ts';
import type { IrMode, IrSpectrum } from '../core/irSpectrum.ts';

import { IrShell } from './IrShell.tsx';
import { IrStateProvider } from './IrStateProvider.tsx';
import { useIrEditor } from './useIrEditor.ts';

export interface IrEditorProps {
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
   * cleared — with the spectra now open.
   *
   * The document only. A zoom, a selection, a rename and a colour change what is
   * being looked at rather than what is loaded, and a host told about those would
   * be told on every drag of the mouse.
   * @default undefined
   */
  onChange?: (spectra: IrSpectrum[]) => void;
  /**
   * Which value axis to open in.
   * @default 'transmittance'
   */
  mode?: IrMode;
  /**
   * The side panels open to begin with.
   * @default DEFAULT_SIDE_PANELS
   */
  defaultPanelIds?: IrSidePanelId[];
  /**
   * The handle a host drives the viewer through: take these spectra, frame this
   * wavenumber, select that one.
   * @default undefined
   */
  ref?: Ref<IrEditorHandle>;
}

/**
 * An infrared spectrum viewer: a header across the top, the chart in the middle,
 * the tools down the left, and the panels that interrogate it down the right.
 *
 * The same shape as the mass viewer, deliberately — a page may well hold both,
 * and a chemist who has learned one should not have to learn the other. The chart
 * is where a spectrum is read and the panels are where it is questioned, which is
 * why the panels are switched on from the activity bar on the far right: a
 * spectrum is mostly chart, and a panel is worth its width only while it is being
 * used.
 *
 * It is sealed the way NMRium is sealed: the spectra go in as `data` and come back
 * through `onChange`, and everything else a host wants — frame this band, take
 * these spectra — is a gesture on the `ref` rather than a prop that has to change
 * to be obeyed.
 * @param props - Component props.
 * @returns The viewer.
 */
export function IrEditor(props: IrEditorProps) {
  const { data = NO_SPECTRA, onChange, mode, defaultPanelIds, ref } = props;

  const editor = useIrEditor({
    spectra: data,
    settings: mode === undefined ? undefined : { mode },
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
        <IrShell handle={ref} />
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
