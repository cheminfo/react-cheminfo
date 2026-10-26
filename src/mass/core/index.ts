/**
 * What a mass spectrum is, and everything true of one that draws nothing.
 *
 * Reading a JCAMP-DX or a two-column text file, picking the peaks of a profile,
 * deciding whether the spectrum is high resolution, choosing which peaks are
 * worth a label, writing the spectra back out as JCAMP — none of it needs
 * React, so a script that reads a directory of spectra loads none.
 *
 * Nothing here knows what a glycan, a peptide or a polymer is, and nothing
 * should: a mass spectrum answers for whatever was put in the source.
 */

export type {
  AnalyseSpectrumOptions,
  AnalysedSpectrum,
} from './analyseSpectrum.ts';
export { analyseSpectrum } from './analyseSpectrum.ts';
export { ascendingTrace } from './ascendingTrace.ts';
export type {
  MassPeakObject,
  SelectCentroidPeaksOptions,
} from './centroidPeaks.ts';
export { centroidPeakObjects, selectCentroidPeaks } from './centroidPeaks.ts';
export type { DetectedMassFormat } from './detectMassFormat.ts';
export { detectMassFormat } from './detectMassFormat.ts';
export {
  downloadMassSpectra,
  downloadMassSpectrum,
} from './downloadSpectra.ts';
export type { MassJcampReadOptions, MassJcampReadResult } from './fromJcamp.ts';
export type { MassTextReadOptions } from './fromText.ts';
export type { JcampBlockHeader } from './jcampTechnique.ts';
export { otherTechnique } from './jcampTechnique.ts';
export type { HoveredPeak, StackBox } from './labelStackBox.ts';
export { labelStackBox } from './labelStackBox.ts';
export type {
  LabelledPeak,
  SelectLabelledPeaksOptions,
} from './labelledPeaks.ts';
export {
  LABEL_SLOTS,
  LABEL_THRESHOLD,
  selectLabelledPeaks,
} from './labelledPeaks.ts';
export type {
  LoadMassSpectraOptions,
  LoadMassSpectraResult,
} from './loadMassSpectra.ts';
export { DEFAULT_MAX_SPECTRA, loadMassSpectra } from './loadMassSpectra.ts';
export type { LoadedMassSpectrum } from './loadedMassSpectrum.ts';
export type {
  MassCommand,
  MassCommandHandlers,
  MassCommandId,
  MassGesture,
  MassShortcut,
  RunMassCommand,
} from './massCommands.ts';
export { massCommandLabel, massCommands } from './massCommands.ts';
export type { MzFrameOptions } from './massDomain.ts';
export {
  MZ_FRAME_HALF_WIDTH,
  X_DOMAIN_PADDING,
  Y_DOMAIN_HEADROOM,
  basePeakOf,
  fittedTo,
  fullDomain,
  mzFrame,
} from './massDomain.ts';
export type {
  MassEditorHandle,
  MassPlotClick,
  ZoomToMzOptions,
} from './massEditorApi.ts';
export {
  INTENSITY_DECIMALS,
  formatIntensity,
  formatMz,
  formatMzRange,
  massFormatLabel,
  resolutionBasisLabel,
  resolutionLabel,
  resolvingPowerLabel,
} from './massFormat.ts';
export type { MassMetaRecord, MassMetaSource } from './massMeta.ts';
export { buildMassMeta, metaRecord, recordText } from './massMeta.ts';
export type { MassAction, SpectrumVisibility } from './massReducer.ts';
export { massReducer } from './massReducer.ts';
export type {
  MassResolution,
  MassResolutionBasis,
  MassResolutionKind,
  WidthPeak,
} from './massResolution.ts';
export {
  HIGH_RESOLVING_POWER,
  MEASURED_PEAKS,
  MZ_DECIMALS,
  measuredResolution,
  statedResolution,
} from './massResolution.ts';
export type { MassPanelId, MassSidePanelId } from './massSidePanels.ts';
export { massSidePanels } from './massSidePanels.ts';
export type {
  MassDomain,
  MassFormat,
  MassMeta,
  MassMetaField,
  MassOrigin,
  MassPeaks,
  MassSpectrum,
  MassTrace,
} from './massSpectrum.ts';
export { isSpectrumDrawn } from './massSpectrum.ts';
export type {
  CreateMassStateOptions,
  MassData,
  MassSettings,
  MassState,
  MassTool,
  MassView,
  PartialMassState,
} from './massState.ts';
export {
  DEFAULT_LABEL_LIMIT,
  DEFAULT_SETTINGS,
  DEFAULT_SIDE_PANEL,
  DEFAULT_SIDE_PANELS,
  MAXIMUM_LABEL_LIMIT,
  createMassState,
  isMassWindow,
  mergeMassSettings,
} from './massState.ts';
export type { SpectrumSubtitleOptions } from './massSummary.ts';
export {
  spectrumFileFields,
  spectrumMetaRows,
  spectrumResolutionRows,
  spectrumSubtitle,
} from './massSummary.ts';
export type { MzDecimalsSetting } from './mzDecimalsSetting.ts';
export {
  MAXIMUM_MZ_DECIMALS,
  mzDecimalsFor,
  readMzDecimalsSetting,
} from './mzDecimalsSetting.ts';
export type { NearestPeak } from './nearestPeak.ts';
export {
  PEAK_HIT_RADIUS,
  nearestPeakMz,
  peakAtMz,
  sameNearestPeak,
} from './nearestPeak.ts';
export type {
  PeakLabelLine,
  PeakLabelLineKind,
  PeakLabelLinesOptions,
} from './peakLabelLines.ts';
export { peakKey, peakLabelLines } from './peakLabelLines.ts';
export type { PeakLabelPlan, PlanPeakLabelsOptions } from './peakLabelPlan.ts';
export { LABEL_SPACING, planPeakLabels } from './peakLabelPlan.ts';
export type { PeakTableOptions } from './peakTable.ts';
export {
  PEAK_TABLE_LIMIT,
  PEAK_TABLE_THRESHOLD,
  peakTableRows,
  peakTableToTsv,
} from './peakTable.ts';
export type { DecideResolutionOptions } from './resolutionOf.ts';
export {
  decideResolution,
  mzDecimalsOf,
  resolutionOf,
} from './resolutionOf.ts';
export { parseScanFilter } from './scanFilter.ts';
export type {
  MassTraceKind,
  TraceIconClick,
  TraceIconState,
} from './traceIcon.ts';
export { nextTraceIconClick, traceIconState } from './traceIcon.ts';
export {
  JCAMP_EXTENSION,
  JCAMP_MIME_TYPE,
  massSpectraToJcamp,
  massSpectrumToJcamp,
} from './spectrumJcamp.ts';
export type { ToMassSpectrumOptions } from './toMassSpectrum.ts';
export { toMassSpectra, toMassSpectrum } from './toMassSpectrum.ts';
export {
  MAXIMUM_WRITTEN_DECIMALS,
  writtenDecimals,
  writtenResolution,
} from './writtenResolution.ts';
