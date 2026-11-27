import type { SpectrumViewerProps } from './VibrationalEditor.tsx';
import { VibrationalEditor } from './VibrationalEditor.tsx';

/** What the infrared viewer takes. */
export type IrEditorProps = SpectrumViewerProps;

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
 *
 * It opens in transmittance unless `mode` says absorbance; intensity, which
 * infrared does not offer, opens transmittance too.
 * @param props - Component props.
 * @returns The viewer.
 */
export function IrEditor(props: IrEditorProps) {
  return <VibrationalEditor technique="infrared" {...props} />;
}
