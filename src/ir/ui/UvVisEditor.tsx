import type { ReactNode, Ref } from 'react';

import type { IrEditorHandle, IrPlotClick } from '../core/irEditorApi.ts';
import type { IrPanelId } from '../core/irSidePanels.ts';
import type { IrMode, IrSpectrum } from '../core/irSpectrum.ts';

import { VibrationalEditor } from './VibrationalEditor.tsx';
import type { IrHostPanel } from './irHostPanels.ts';

/** The handle a host drives a UV-vis viewer through: the infrared one's. */
export type UvVisEditorHandle = IrEditorHandle;

export interface UvVisEditorProps {
  /**
   * The spectra to open on, each carrying its absorbance and transmittance
   * over its wavelengths in nanometres, held as `wavenumber`. Read when the
   * viewer opens and never again: the `ref` handle is how spectra arrive
   * afterwards.
   * @default []
   */
  data?: IrSpectrum[];
  /**
   * Called whenever the spectra open change — one loaded, one closed, the chart
   * cleared, the maxima of one picked — with the spectra now open. Not called
   * for a zoom, a selection, a rename or a colour.
   * @default undefined
   */
  onChange?: (spectra: IrSpectrum[]) => void;
  /**
   * Which value axis to open in: absorbance or transmittance.
   * @default 'absorbance'
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
   * Panels the host adds to the viewer's own. Their icons come first in the
   * activity bar, in the order given.
   * @default []
   */
  panels?: readonly IrHostPanel[];
  /**
   * The plot was clicked at this wavelength (a press that did not travel, i.e.
   * not a zoom drag), with the spectrum selected at that moment. The wavelength
   * is reported as `wavenumber`, the name every technique of the viewer shares.
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
   * The handle a host drives the viewer through: take these spectra, frame
   * this wavelength, select that one.
   * @default undefined
   */
  ref?: Ref<UvVisEditorHandle>;
}

/**
 * A UV-vis spectrum viewer: the infrared viewer's shell, panels, gestures and
 * export, changed only where UV-vis is physically different.
 *
 * The wavelength runs from short at the left to long at the right, in
 * nanometres; the spectra are read as absorbance or percent transmittance,
 * absorbance first; every λmax is picked as a maximum of absorbance; and the
 * infrared correlation table is not asked what a band might be.
 * @param props - Component props.
 * @returns The viewer.
 */
export function UvVisEditor(props: UvVisEditorProps) {
  return <VibrationalEditor technique="uvvis" {...props} />;
}
