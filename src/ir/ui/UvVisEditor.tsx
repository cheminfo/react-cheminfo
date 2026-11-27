import type { IrEditorHandle } from '../core/irEditorApi.ts';

import type { SpectrumViewerProps } from './VibrationalEditor.tsx';
import { VibrationalEditor } from './VibrationalEditor.tsx';

/** The handle a host drives a UV-vis viewer through: the infrared one's. */
export type UvVisEditorHandle = IrEditorHandle;

/**
 * What the UV-vis viewer takes: the shared props, less the band assignments.
 * Each spectrum carries its absorbance and transmittance over its wavelengths
 * in nanometres, held as `wavenumber`, and opens in absorbance unless `mode`
 * says transmittance.
 */
export type UvVisEditorProps = Omit<SpectrumViewerProps, 'assignments'>;

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
