/**
 * What an X-ray photoelectron spectrum is, and everything true of one that
 * draws nothing.
 *
 * Reading a VAMAS, JCAMP-DX or text file, picking the peaks of a trace, naming
 * the elements they could be, subtracting a background, integrating a window,
 * quantifying a fit and holding the viewer's state — none of it needs React, so
 * a script that reads a directory of spectra loads none.
 *
 * Two invariants run under all of it and must stay. `energy` is binding energy
 * in eV with x **ascending**: the published convention of high binding energy
 * on the left is a reversed axis rather than reversed data. And the fit is the
 * file's — position, width, area and sensitivity factor are read as CasaXPS
 * wrote them and never substituted from a table of our own, because a
 * composition quantified with another laboratory's numbers is not the analyst's
 * composition.
 */

// The spectrum itself.
export type {
  XpsComponent,
  XpsDomain,
  XpsFormat,
  XpsMeta,
  XpsMetaField,
  XpsOrigin,
  XpsPeak,
  XpsRegion,
  XpsSpectrum,
  XpsTrace,
  XpsTransition,
} from './xpsSpectrum.ts';
export { boundsDomain, isFitted } from './xpsSpectrum.ts';
export {
  convertEnergyAxis,
  isUsableSourceEnergy,
  toBindingEnergy,
  toKineticEnergy,
} from './energy.ts';
export {
  ENERGY_DECIMALS,
  PERCENT_DECIMALS,
  formatCounts,
  formatEnergy,
  formatOrbital,
  formatPercent,
} from './peakFormat.ts';
// The family's palette, offered here too so a page placing spectra on the
// chart names their colours from the same door it reads them through.
export {
  SPECTRUM_COLORS,
  nextSpectrumColor,
} from '../../chart/core/spectrumColor.ts';

// Reading a file, whatever it turns out to be. The three readers are not
// exported as values: `loadSpectra` imports each one only once the bytes turn
// out to need it, and a barrel naming them would pull all three into the entry
// chunk.
export type { LoadSpectraOptions, LoadSpectraResult } from './loadSpectra.ts';
export { loadSpectra } from './loadSpectra.ts';
export { detectFormat } from './detectFormat.ts';
export type { XpsReadOptions } from './readOptions.ts';
export type { AnalysisBlocksOptions } from './fromAnalysisBlocks.ts';
export {
  MINIMUM_BLOCK_POINTS,
  readAnalysisBlocks,
} from './fromAnalysisBlocks.ts';
export type { TextReadOptions } from './fromText.ts';
export type { BlockContext } from './analysisSpectrum.ts';
export type { XpsMetaSource } from './spectrumMeta.ts';
export { buildXpsMeta } from './spectrumMeta.ts';

// What is read off a trace, as opposed to off the file.
export type { PickPeaksOptions } from './pickPeaks.ts';
export { MINIMUM_PICKING_POINTS, pickPeaks } from './pickPeaks.ts';
export {
  intensitySpan,
  peakProminence,
  summitIndex,
} from './peakProminence.ts';
export type { LineStrength } from './lineStrength.ts';
export { lineStrength } from './lineStrength.ts';
export type {
  AssignElementsOptions,
  ElementCandidate,
  ElementPeakCount,
} from './assignElements.ts';
export {
  DEFAULT_ASSIGNMENT_LIMIT,
  DEFAULT_ASSIGNMENT_TOLERANCE,
  assignElements,
  assignSpectrum,
  countedElements,
} from './assignElements.ts';
export type { ReferenceLevel } from './referenceLevels.ts';
export {
  referenceElements,
  referenceEnergies,
  referenceLevels,
} from './referenceLevels.ts';
export type {
  ApplyBackgroundOptions,
  BackgroundKind,
} from './applyBackground.ts';
export { applyBackground, sliceWindow } from './applyBackground.ts';
export type {
  BackgroundOptions,
  BackgroundResult,
  EndpointLevels,
} from './backgroundResult.ts';
export { endpointLevels } from './backgroundResult.ts';
export { linearBackground } from './linearBackground.ts';
export type { ShirleyBackgroundOptions } from './shirleyBackground.ts';
export { shirleyBackground } from './shirleyBackground.ts';
export type { TougaardBackgroundOptions } from './tougaardBackground.ts';
export {
  TOUGAARD_B,
  TOUGAARD_C,
  tougaardBackground,
} from './tougaardBackground.ts';
export type { IntegrateWindowOptions } from './integrate.ts';
export { integrateWindow } from './integrate.ts';
export type {
  CompositionEntry,
  QuantifyComponentsOptions,
} from './quantify.ts';
export { ASSUMED_SENSITIVITY_FACTOR, quantifyComponents } from './quantify.ts';

// A survey quantified with an instrument's sensitivity factors, and the
// formulas its composition could be.
export type { XpsInstrument, XpsSensitivityFactor } from './xpsInstrument.ts';
export {
  BUILT_IN_INSTRUMENTS,
  DEFAULT_INSTRUMENT_ID,
  findInstrument,
  instrumentLines,
  isBuiltInInstrument,
  readInstruments,
  sensitivityFactor,
  xpsInstruments,
} from './xpsInstrument.ts';
export { KRATOS_AL_KA } from './kratosAlKa.ts';
export { SCOFIELD_AL_KA } from './scofieldAlKa.ts';
export { expandFactorTable } from './factorTable.ts';
export type { SensitivityFactorReading } from './instrumentEdits.ts';
export {
  createInstrument,
  factorRows,
  putInstrument,
  readSensitivityFactors,
  removeInstrument,
  withFactor,
  withFactors,
  withoutFactor,
} from './instrumentEdits.ts';
export type { XpsSurveyLine } from './surveyLines.ts';
export {
  SURVEY_WINDOW_ABOVE,
  SURVEY_WINDOW_BELOW,
  VALENCE_LIMIT,
  availableLines,
  chooseSurveyLine,
  lineExtent,
  referenceEnergy,
  surveyLine,
  surveyLineRegions,
} from './surveyLines.ts';
export type { ElementListReading, SurveyLineChoice } from './surveyElements.ts';
export {
  chooseSurveyLines,
  defaultSurveyElements,
  readElementList,
  spectrumExtent,
  surveyLinesOf,
} from './surveyElements.ts';
export type {
  QuantifySurveyOptions,
  SurveyBackground,
  SurveyProblem,
  SurveyQuantity,
} from './quantifySurvey.ts';
export { quantifySurvey, surveyComposition } from './quantifySurvey.ts';
export type {
  FormulaElement,
  FormulaProposal,
  ProposeFormulasOptions,
} from './proposeFormulas.ts';
export { defaultFormulaRanges, proposeFormulas } from './proposeFormulas.ts';

// What is being looked at, shared by everything drawing the same spectra.
export type { XpsHighlight } from './xpsHighlight.ts';
export {
  HIGHLIGHT_ENERGY_EPSILON,
  NO_HIGHLIGHT,
  highlightsComponent,
  highlightsPeak,
  sameXpsHighlight,
} from './xpsHighlight.ts';

// What the chart draws that no other spectrum does. Scales, plot geometry,
// ticks, the zoom arithmetic and the shared theme are the family's chart, in
// `react-cheminfo/core`.
export {
  COMPONENT_STYLE,
  TRACE_WIDTH,
  XPS_CHART_COLORS,
  XPS_CHART_FONT,
  XPS_PEAK_LABEL,
} from './xpsChartTheme.ts';
export { Y_DOMAIN_HEADROOM, fullDomain } from './xpsDomain.ts';
export {
  axisEnergy,
  axisTitle,
  axisTrace,
  bindingFromAxis,
  chartEnergyAxis,
  chartSourceEnergy,
  countsTitle,
  hasBindingAxis,
  isAxisReversed,
} from './energyAxis.ts';
export type { NearestPeak } from './nearestPeak.ts';
export {
  PEAK_HIT_RADIUS,
  nearestPeakEnergy,
  sameNearestPeak,
} from './nearestPeak.ts';
export type { LabelledPeaksOptions } from './labelledPeaks.ts';
export { selectLabelledPeaks } from './labelledPeaks.ts';
export type {
  PeakLabelLine,
  PeakLabelLineKind,
  PeakLabelLinesOptions,
} from './peakLabelLines.ts';
export { peakLabelLines } from './peakLabelLines.ts';
export type {
  ComponentPeak,
  ComponentShape,
  ComponentShapeKind,
} from './componentShape.ts';
export {
  DEFAULT_LORENTZIAN_FRACTION,
  GAUSSIAN_INTEGRAL,
  LORENTZIAN_INTEGRAL,
  parseComponentShape,
  shapeValue,
} from './componentShape.ts';
export {
  COMPONENT_SAMPLES,
  componentAmplitude,
  componentIntensity,
  componentTrace,
  envelopeTrace,
} from './componentTrace.ts';
export type { RegionBand } from './regionBands.ts';
export { bandRectangle, regionBands } from './regionBands.ts';
export {
  NORMALISED_MAXIMUM,
  normalisationFactor,
  normalisedScale,
  windowMaximum,
} from './normalise.ts';
export { tracePath } from './tracePath.ts';
export { XPS_ZOOM_RULES, pannedDomain, sameXpsDomain } from './xpsZoom.ts';

// The three buckets, and the reducer over them.
export type {
  EnergyAxis,
  PartialXpsState,
  XpsData,
  XpsSettings,
  XpsState,
  XpsView,
} from './xpsState.ts';
export {
  DEFAULT_LABEL_LIMIT,
  DEFAULT_SETTINGS,
  DEFAULT_SIDE_PANEL,
  DEFAULT_SIDE_PANELS,
  MAXIMUM_LABEL_LIMIT,
  MAXIMUM_REFERENCE_TOLERANCE,
  isUsableTolerance,
  isXpsWindow,
  mergeXpsSettings,
  sameXpsSettings,
} from './xpsState.ts';
export type {
  XpsAction,
  XpsDataAction,
  XpsLoadAction,
  XpsSettingsAction,
  XpsViewAction,
} from './xpsAction.ts';
export type { CreateXpsStateOptions } from './xpsReducer.ts';
export { createXpsState, xpsReducer } from './xpsReducer.ts';
export type { XpsEditorActions } from './xpsActions.ts';
export { createXpsActions } from './xpsActions.ts';
export { loadXpsState } from './loadXpsState.ts';
export type { XpsPanelId, XpsSidePanelId } from './xpsSidePanels.ts';
export { xpsSidePanels } from './xpsSidePanels.ts';

// The rows the panels are built from.
export type { PeakRow, PeakRowsOptions } from './peakRows.ts';
export { buildPeakRows, peakElementText, peakRowsToTsv } from './peakRows.ts';
export type { ElementRow, ElementRowsOptions } from './elementRows.ts';
export { buildElementRows, countIdentifiedPeaks } from './elementRows.ts';
export type { ComponentRow } from './componentRows.ts';
export { buildComponentRows, totalComponentArea } from './componentRows.ts';
export type { CompositionRow } from './compositionRows.ts';
export {
  assumedWarning,
  buildCompositionRows,
  countAssumed,
} from './compositionRows.ts';
export type { SpectrumGroup } from './spectrumGroups.ts';
export {
  UNNAMED_SAMPLE_LABEL,
  countVisible,
  findSpectrum,
  groupSpectraBySample,
  hasSampleGroups,
} from './spectrumGroups.ts';

// The instrument's commands and the handle a host holds it by.
export type { XpsEditorHandle, ZoomToEnergyOptions } from './xpsEditorApi.ts';
export { ENERGY_WINDOW } from './xpsEditorApi.ts';
export type {
  XpsCommand,
  XpsCommandId,
  XpsGesture,
  XpsShortcut,
} from './xpsCommands.ts';
export {
  matchXpsCommand,
  xpsCommand,
  xpsCommands,
  xpsShortcutLabels,
} from './xpsCommands.ts';
