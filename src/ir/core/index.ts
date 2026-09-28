/**
 * What an infrared spectrum is, and everything true of one that draws nothing.
 *
 * Reading a file, picking the bands, saying what each band might be, writing
 * the spectra back out as JCAMP — none of it needs React, so a script that
 * assigns a directory of spectra loads none.
 *
 * What is here is only what is true of infrared: that the axis runs from 4000
 * down to 400, that a spectrum is read either as absorbance or as percent
 * transmittance and a band points the other way in each, and that a wavenumber
 * maps to a range of vibrations rather than to one. Nothing here knows what a
 * glycan is, and nothing should: an infrared spectrum answers for whatever was
 * put in the beam.
 */

export type { LoadedIrSpectrum } from './analysisSpectra.ts';
export { analysisSpectra } from './analysisSpectra.ts';
export type { AssignBandsOptions, AssignedBand } from './assignBands.ts';
export { assignBands, bandLabel, countAssigned } from './assignBands.ts';
export type { BandAssignment } from './bandAssignments.ts';
export { BAND_ASSIGNMENTS } from './bandAssignments.ts';
export type { BandLabelPlan, BandLabelPlanOptions } from './bandLabelPlan.ts';
export { planBandLabels } from './bandLabelPlan.ts';
export { detectIrFormat } from './detectIrFormat.ts';
export { downloadIrSpectra, downloadIrSpectrum } from './downloadSpectra.ts';
export type { IrJcampReadOptions } from './fromJcamp.ts';
export type { IrSpcReadOptions } from './fromSpc.ts';
export type { IrBand, IrBandStrength } from './irBand.ts';
export { sameIrBand } from './irBand.ts';
export type {
  IrCommand,
  IrCommandHandlers,
  IrCommandId,
  IrGesture,
  IrShortcut,
  RunIrCommand,
} from './irCommands.ts';
export { irCommandLabel, irCommands } from './irCommands.ts';
export {
  LABEL_HEADROOM,
  X_DOMAIN_PADDING,
  Y_DOMAIN_PADDING,
  fittedTo,
  fullDomain,
} from './irDomain.ts';
export type { IrEditorHandle, ZoomToBandOptions } from './irEditorApi.ts';
export {
  ABSORBANCE_DECIMALS,
  TRANSMITTANCE_DECIMALS,
  formatIrValue,
  formatWavenumber,
  shortModeLabel,
} from './irFormat.ts';
export {
  IR_MODES,
  IR_MODE_RULES,
  bandsPointDown,
  boxZoomOnly,
  otherIrMode,
  yAxisRules,
  yAxisTitle,
  zoomGestures,
} from './irMode.ts';
export type { CreateIrStateOptions, IrAction } from './irReducer.ts';
export { createIrState, irReducer } from './irReducer.ts';
export type {
  IrDomain,
  IrFormat,
  IrMeta,
  IrMetaField,
  IrMode,
  IrOrigin,
  IrSpectrum,
  IrTrace,
} from './irSpectrum.ts';
export { traceOf } from './irSpectrum.ts';
export type {
  IrData,
  IrSettings,
  IrState,
  IrTool,
  IrView,
  PartialIrState,
} from './irState.ts';
export {
  DEFAULT_LABEL_LIMIT,
  DEFAULT_PICKING,
  DEFAULT_SETTINGS,
  DEFAULT_SIDE_PANEL,
  DEFAULT_SIDE_PANELS,
  MAXIMUM_LABEL_LIMIT,
  isIrWindow,
  mergeIrSettings,
} from './irState.ts';
export type {
  LoadIrSpectraOptions,
  LoadIrSpectraResult,
} from './loadIrSpectra.ts';
export { loadIrSpectra } from './loadIrSpectra.ts';
export { BAND_HIT_RADIUS, nearestBandAt } from './nearestBand.ts';
export type { PickBandsOptions } from './pickBands.ts';
export { pickBands } from './pickBands.ts';
export {
  DEFAULT_DATA_TYPE,
  JCAMP_EXTENSION,
  JCAMP_MIME_TYPE,
  irSpectraToJcamp,
  irSpectrumToJcamp,
} from './spectrumJcamp.ts';
export type { ToIrSpectrumOptions } from './toIrSpectrum.ts';
export { toIrSpectra, toIrSpectrum } from './toIrSpectrum.ts';
export type { IrSidePanelId } from './irSidePanels.ts';
export { irSidePanels } from './irSidePanels.ts';
