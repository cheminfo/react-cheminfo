/**
 * Displaying UV-vis and fluorescence spectra: the infrared viewer, read for
 * light absorbed and for light emitted.
 *
 * A door of its own so a page showing these spectra imports its viewers by
 * name, and so `uv-spectrum`, which reads the files of both, is fetched only by
 * a page that opens one. What it opens is the same code as
 * `react-cheminfo/ir` — one shell, one set of panels — and the same spectrum
 * model, its horizontal position a wavelength in nanometres held as
 * `wavenumber`.
 */

export type { LoadedIrSpectrum } from './ir/core/analysisSpectra.ts';
export type { IrBand } from './ir/core/irBand.ts';
export type { IrEditorHandle, IrPlotClick } from './ir/core/irEditorApi.ts';
export { IR_FIGURE_SELECTOR } from './ir/core/irEditorApi.ts';
export { bandsFromUvPeaks, uvPeaksFromBands } from './ir/core/irPeaks.ts';
export type { IrMode, IrSpectrum } from './ir/core/irSpectrum.ts';
export type { PartialIrState } from './ir/core/irState.ts';
export { DEFAULT_PICKING, createIrState } from './ir/core/irState.ts';
export type { IrViewerRecord } from './ir/core/irViewerRecord.ts';
export {
  irViewerRecord,
  readIrViewerRecord,
} from './ir/core/irViewerRecord.ts';
export type {
  LoadIrSpectraOptions,
  LoadIrSpectraResult,
} from './ir/core/loadIrSpectra.ts';
export type { LoadUvVisSpectraResult } from './ir/core/loadUvVisSpectra.ts';
export { loadUvVisSpectra } from './ir/core/loadUvVisSpectra.ts';
export {
  irSpectraToJcamp,
  irSpectrumToJcamp,
} from './ir/core/spectrumJcamp.ts';
export { withBands } from './ir/core/spectrumBands.ts';
export { toIrSpectra, toIrSpectrum } from './ir/core/toIrSpectrum.ts';
export type {
  FluorescenceEditorHandle,
  FluorescenceEditorProps,
} from './ir/ui/FluorescenceEditor.tsx';
export { FluorescenceEditor } from './ir/ui/FluorescenceEditor.tsx';
export type { IrHostPanel } from './ir/ui/irHostPanels.ts';
export type {
  UvVisEditorHandle,
  UvVisEditorProps,
} from './ir/ui/UvVisEditor.tsx';
export { UvVisEditor } from './ir/ui/UvVisEditor.tsx';
