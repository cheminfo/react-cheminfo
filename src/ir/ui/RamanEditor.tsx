import type { Ref } from 'react';

import type { IrEditorHandle } from '../core/irEditorApi.ts';
import type { IrSidePanelId } from '../core/irSidePanels.ts';
import type { IrSpectrum } from '../core/irSpectrum.ts';

import { VibrationalEditor } from './VibrationalEditor.tsx';

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
   * The side panels open to begin with.
   * @default DEFAULT_SIDE_PANELS
   */
  defaultPanelIds?: IrSidePanelId[];
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
