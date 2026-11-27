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
export { toBindingEnergy, toKineticEnergy } from './energy.ts';
export { formatCounts, formatEnergy } from './peakFormat.ts';
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
export { readAnalysisBlocks } from './fromAnalysisBlocks.ts';

// What is read off a trace, as opposed to off the file.
export type { PickPeaksOptions } from './pickPeaks.ts';
export { pickPeaks } from './pickPeaks.ts';
export type { LineStrength } from './lineStrength.ts';
export type {
  AssignElementsOptions,
  ElementCandidate,
} from './assignElements.ts';
export { assignElements } from './assignElements.ts';
export type { ReferenceLevel } from './referenceLevels.ts';
export { referenceLevels } from './referenceLevels.ts';
export type {
  ApplyBackgroundOptions,
  BackgroundKind,
} from './applyBackground.ts';
export { applyBackground } from './applyBackground.ts';
export type {
  BackgroundOptions,
  BackgroundResult,
} from './backgroundResult.ts';
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
export { quantifyComponents } from './quantify.ts';

// A survey quantified with an instrument's sensitivity factors, and the
// formulas its composition could be.
export type { XpsInstrument, XpsSensitivityFactor } from './xpsInstrument.ts';
export { KRATOS_AL_KA } from './kratosAlKa.ts';
export { SCOFIELD_AL_KA } from './scofieldAlKa.ts';
export type { XpsSurveyLine } from './surveyLines.ts';
export { surveyLinesOf } from './surveyElements.ts';
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
export { proposeFormulas } from './proposeFormulas.ts';

// What is being looked at, shared by everything drawing the same spectra, and
// what a host placing its own layer over the chart needs to place it.
export type { XpsHighlight } from './xpsHighlight.ts';
export { NO_HIGHLIGHT } from './xpsHighlight.ts';
export { fullDomain } from './xpsDomain.ts';
export {
  axisEnergy,
  axisTrace,
  bindingFromAxis,
  chartEnergyAxis,
  chartSourceEnergy,
} from './energyAxis.ts';

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
  DEFAULT_SETTINGS,
  DEFAULT_SIDE_PANELS,
  mergeXpsSettings,
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
export type { XpsPanelId, XpsSidePanelId } from './xpsSidePanels.ts';

// The instrument's commands and the handle a host holds it by.
export type { XpsEditorHandle, ZoomToEnergyOptions } from './xpsEditorApi.ts';
export { ENERGY_WINDOW } from './xpsEditorApi.ts';
