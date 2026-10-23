import type { Ref } from 'react';

import type { IrEditorHandle, IrPlotClick } from '../core/irEditorApi.ts';
import type { IrPanelId } from '../core/irSidePanels.ts';
import type { IrMode, IrSpectrum } from '../core/irSpectrum.ts';

import { VibrationalEditor } from './VibrationalEditor.tsx';
import type { IrHostPanel } from './irHostPanels.ts';

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
   * Which value axis to open in: transmittance or absorbance. Intensity, which
   * infrared does not offer, opens transmittance instead.
   * @default 'transmittance'
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
   * The plot was clicked at this wavenumber (a press that did not travel, i.e.
   * not a zoom drag), with the spectrum selected at that moment.
   * @default undefined
   */
  onPlotClick?: (click: IrPlotClick) => void;
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
 * `RamanEditor`, from `react-cheminfo/raman`, is the same viewer for Raman.
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
  return <VibrationalEditor technique="infrared" {...props} />;
}
