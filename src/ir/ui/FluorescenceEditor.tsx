import type { IrEditorHandle } from '../core/irEditorApi.ts';

import type { UvVisEditorProps } from './UvVisEditor.tsx';
import { VibrationalEditor } from './VibrationalEditor.tsx';

/** The handle a host drives a fluorescence viewer through: the infrared one's. */
export type FluorescenceEditorHandle = IrEditorHandle;

/**
 * What a fluorescence viewer takes: a UV-vis viewer's props, less the value
 * axis, since an emission spectrum is read as its intensity alone. The spectra
 * carry that intensity over their wavelengths in nanometres, held as
 * `wavenumber`.
 */
export type FluorescenceEditorProps = Omit<UvVisEditorProps, 'mode'>;

/**
 * A fluorescence spectrum viewer: the infrared viewer's shell, panels,
 * gestures and export, read as the UV-vis one is — wavelength from short at
 * the left to long at the right, in nanometres — with one value axis, the
 * intensity emitted, and every emission maximum picked on it.
 * @param props - Component props.
 * @returns The viewer.
 */
export function FluorescenceEditor(props: FluorescenceEditorProps) {
  return <VibrationalEditor technique="fluorescence" {...props} />;
}
