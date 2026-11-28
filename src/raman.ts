/**
 * Displaying Raman spectra: the infrared viewer, read for Raman.
 *
 * A door of its own so a page showing Raman spectra imports a Raman viewer by
 * name. What it opens is the same code as `react-cheminfo/ir` — one shell, one
 * set of panels — and the same spectrum model, which a host fills with an
 * `intensity` array where an infrared spectrum carries absorbance and
 * transmittance. `loadRamanSpectra` fills it from a file: JCAMP-DX, SPC,
 * Renishaw WDF or two columns of text.
 */

export type { LoadedIrSpectrum } from './ir/core/analysisSpectra.ts';
export type { IrEditorHandle, IrPlotClick } from './ir/core/irEditorApi.ts';
export { bandsFromRamanPeaks, ramanPeaksFromBands } from './ir/core/irPeaks.ts';
export type { IrSpectrum } from './ir/core/irSpectrum.ts';
export type {
  LoadIrSpectraOptions,
  LoadIrSpectraResult,
} from './ir/core/loadIrSpectra.ts';
export { loadRamanSpectra } from './ir/core/loadRamanSpectra.ts';
export { toIrSpectra } from './ir/core/toIrSpectrum.ts';
export type { IrHostPanel } from './ir/ui/irHostPanels.ts';
export type {
  RamanEditorHandle,
  RamanEditorProps,
} from './ir/ui/RamanEditor.tsx';
export { RamanEditor } from './ir/ui/RamanEditor.tsx';
export { readHostRamanSpectra } from './ir/core/hostIrSpectra.ts';
export type {
  HostSpectraSession,
  HostSpectraSessionOptions,
  HostSpectraTab,
} from './ir/core/hostSpectraSession.ts';
export { createHostSpectraSession } from './ir/core/hostSpectraSession.ts';
export type {
  HostItemName,
  HostSpectra,
  HostSpectrumItem,
} from './ir/core/hostSpectraRead.ts';
export { NO_HOST_SPECTRA } from './ir/core/hostSpectraRead.ts';
export { spectrumLabel } from './ir/core/spectrumLabel.ts';
export type {
  SpectraDocument,
  SpectraDocumentOptions,
} from './ir/ui/useSpectraDocument.tsx';
export { useSpectraDocument } from './ir/ui/useSpectraDocument.tsx';
