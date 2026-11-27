import type { IrEditorHandle } from '../core/irEditorApi.ts';

import type { SpectrumViewerProps } from './VibrationalEditor.tsx';
import { VibrationalEditor } from './VibrationalEditor.tsx';

/** The handle a host drives a Raman viewer through: the infrared one's. */
export type RamanEditorHandle = IrEditorHandle;

/**
 * What the Raman viewer takes: the shared props, less the value axis and the
 * band assignments, which Raman does not have. Each spectrum carries its
 * `intensity`, over its Raman shifts held as `wavenumber`.
 */
export type RamanEditorProps = Omit<
  SpectrumViewerProps,
  'mode' | 'assignments'
>;

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
