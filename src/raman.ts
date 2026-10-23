/**
 * Displaying Raman spectra: the infrared viewer, read for Raman.
 *
 * A door of its own so a page showing Raman spectra imports a Raman viewer by
 * name. What it opens is the same code as `react-cheminfo/ir` — one shell, one
 * set of panels — and the same spectrum model, which a host fills with an
 * `intensity` array where an infrared spectrum carries absorbance and
 * transmittance.
 */

export type { LoadedIrSpectrum } from './ir/core/analysisSpectra.ts';
export type { IrEditorHandle, IrPlotClick } from './ir/core/irEditorApi.ts';
export type { IrSpectrum } from './ir/core/irSpectrum.ts';
export { toIrSpectra } from './ir/core/toIrSpectrum.ts';
export type { IrHostPanel } from './ir/ui/irHostPanels.ts';
export type {
  RamanEditorHandle,
  RamanEditorProps,
} from './ir/ui/RamanEditor.tsx';
export { RamanEditor } from './ir/ui/RamanEditor.tsx';
