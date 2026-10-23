import type { Ref } from 'react';

import type { IrEditorHandle, IrPlotClick } from '../core/irEditorApi.ts';
import type { IrPanelId } from '../core/irSidePanels.ts';
import type { IrSpectrum } from '../core/irSpectrum.ts';

import { VibrationalEditor } from './VibrationalEditor.tsx';
import type { IrHostPanel } from './irHostPanels.ts';

/** The handle a host drives a Raman viewer through: the infrared one's. */
export type RamanEditorHandle = IrEditorHandle;

export interface RamanEditorProps {
  /**
   * The spectra to open on, each carrying its `intensity`. Read when the viewer
   * opens and never again: what is on the chart belongs to the viewer from then
   * on. The `ref` handle is how spectra arrive afterwards.
   * @default []
   */
  data?: IrSpectrum[];
  /**
   * Called whenever the spectra open change — one loaded, one closed, the chart
   * cleared — with the spectra now open. Not called for a zoom, a selection, a
   * rename or a colour.
   * @default undefined
   */
  onChange?: (spectra: IrSpectrum[]) => void;
  /**
   * The side panels open to begin with: the viewer's own — `'spectra'`,
   * `'bands'`, `'metadata'` — or the id of one of `panels`. An id no panel
   * answers to is ignored.
   * @default DEFAULT_SIDE_PANELS
   */
  defaultPanelIds?: readonly IrPanelId[];
  /**
   * Panels the host adds to the viewer's own. Their icons come first in the
   * activity bar, in the order given, and each then behaves as a built-in panel
   * does: toggled on its own, stacked in the same column with a share of its
   * height, folded and closed from its header.
   * @default []
   */
  panels?: readonly IrHostPanel[];
  /**
   * The plot was clicked at this Raman shift (a press that did not travel, i.e.
   * not a zoom drag), with the spectrum selected at that moment. The shift is
   * reported as `wavenumber`, the name both techniques share.
   * @default undefined
   */
  onPlotClick?: (click: IrPlotClick) => void;
  /**
   * The handle a host drives the viewer through: take these spectra, frame this
   * Raman shift, select that one.
   * @default undefined
   */
  ref?: Ref<RamanEditorHandle>;
}

/**
 * A Raman spectrum viewer: the infrared viewer's shell, panels, gestures and
 * export, changed only where Raman is physically different.
 *
 * The spectra are read as intensity, their one value axis, so there is no mode
 * to choose; the Raman shift runs from low at the left to high at the right;
 * the bands are picked as maxima of intensity; and the infrared correlation
 * table is not asked what a band might be.
 * @param props - Component props.
 * @returns The viewer.
 */
export function RamanEditor(props: RamanEditorProps) {
  return <VibrationalEditor technique="raman" {...props} />;
}
