/**
 * The spectra the panel tests are built from.
 *
 * One builder rather than a copy in each file: an `XpsSpectrum` carries sixteen
 * fields and a row builder reads three of them, so a literal per test would bury
 * the one number that matters under a dozen that do not — and would have to be
 * revisited everywhere the next time the model gains a field.
 */

import { convertEnergyAxis } from '../energy.ts';
import type {
  XpsComponent,
  XpsMeta,
  XpsPeak,
  XpsRegion,
  XpsSpectrum,
} from '../xpsSpectrum.ts';

/** What a test wants to say about a spectrum, everything else being usual. */
export interface PanelSpectrumOptions {
  /**
   * What the list calls it.
   * @default the identity
   */
  name?: string;
  /**
   * The sample the block was measured on, which is what the list groups by.
   * @default undefined
   */
  sampleId?: string;
  /**
   * The block identifier, as the file wrote it.
   * @default 'C 1s'
   */
  transitionName?: string;
  /**
   * Element of the core level, `null` on a survey scan.
   * @default 'C'
   */
  element?: string | null;
  /**
   * The photon energy in eV, `null` for a file that states none — which is the
   * one case where there is no binding axis to be had.
   * @default 1486.6
   */
  sourceEnergy?: number | null;
  /**
   * The energies in eV of binding energy, ascending.
   * @default [280, 285, 290]
   */
  energy?: number[];
  /**
   * The maxima the detection found.
   * @default no peaks
   */
  peaks?: XpsPeak[];
  /**
   * The peaks the file was fitted with.
   * @default no components
   */
  components?: XpsComponent[];
  /**
   * The windows a background was drawn under.
   * @default no regions
   */
  regions?: XpsRegion[];
  /**
   * What the file said about the acquisition.
   * @default null
   */
  meta?: XpsMeta | null;
  /**
   * Whether the trace is drawn.
   * @default true
   */
  visible?: boolean;
}

/**
 * A spectrum as a panel test wants one.
 * @param id - Its identity, which is also its name unless one is given.
 * @param options - What this test wants to say about it.
 * @returns The spectrum.
 */
export function spectrumFixture(
  id: string,
  options: PanelSpectrumOptions = {},
): XpsSpectrum {
  const {
    name = id,
    sampleId,
    transitionName = 'C 1s',
    element = 'C',
    sourceEnergy = 1486.6,
    energy = [280, 285, 290],
    peaks = [],
    components = [],
    regions = [],
    meta = null,
    visible = true,
  } = options;

  const x = Float64Array.from(energy);
  const y = new Float64Array(energy.length);
  for (let index = 0; index < y.length; index++) y[index] = 100 * (index + 1);
  const kinetic =
    sourceEnergy === null ? null : { x: convertEnergyAxis(x, sourceEnergy), y };

  return {
    id,
    name,
    color: '#1f77b4',
    energy: { x, y },
    kinetic,
    sourceEnergy,
    transition: {
      name: transitionName,
      element,
      shell: element === null ? null : 1,
      angularMomentum: element === null ? null : 's',
      augerElement: null,
      augerTransition: null,
    },
    peaks,
    components,
    regions,
    meta,
    origin: { format: 'vamas', sampleId },
    visible,
  };
}

/**
 * One picked peak.
 * @param id - Its identity.
 * @param bindingEnergy - Where the maximum sits, in eV.
 * @param intensity - The counts there.
 * @param width - Width at half maximum in eV.
 * @returns The peak.
 */
export function peakFixture(
  id: string,
  bindingEnergy: number,
  intensity = 1000,
  width = 1.2,
): XpsPeak {
  return { id, bindingEnergy, intensity, width };
}

/** What a test wants to say about a fitted component. */
export interface PanelComponentOptions {
  /**
   * What the fit calls it.
   * @default the identity
   */
  label?: string;
  /**
   * Full width at half maximum, in eV.
   * @default 1
   */
  fwhm?: number;
  /**
   * The peak shape the fit used.
   * @default 'GL(30)'
   */
  shape?: string;
  /**
   * The factor the area is divided by, `null` when the file states none.
   * @default null
   */
  relativeSensitivityFactor?: number | null;
  /**
   * The region it was fitted inside.
   * @default null
   */
  regionId?: string | null;
}

/**
 * One fitted component.
 * @param id - Its identity.
 * @param bindingEnergy - Where it sits, in eV.
 * @param area - Area under it, in the file's own units.
 * @param options - What this test wants to say about it.
 * @returns The component.
 */
export function componentFixture(
  id: string,
  bindingEnergy: number,
  area: number,
  options: PanelComponentOptions = {},
): XpsComponent {
  const {
    label = id,
    fwhm = 1,
    shape = 'GL(30)',
    relativeSensitivityFactor = null,
    regionId = null,
  } = options;
  return {
    id,
    label,
    bindingEnergy,
    kineticEnergy: null,
    area,
    fwhm,
    shape,
    relativeSensitivityFactor,
    atomicMass: null,
    regionId,
  };
}

/**
 * One region a background was drawn under.
 * @param id - Its identity, which is also its label.
 * @param from - Lower bound in eV of binding energy.
 * @param to - Upper bound.
 * @param backgroundType - How the background was drawn.
 * @returns The region.
 */
export function regionFixture(
  id: string,
  from: number,
  to: number,
  backgroundType = 'Shirley',
): XpsRegion {
  return {
    id,
    label: id,
    backgroundType,
    from,
    to,
    relativeSensitivityFactor: null,
    atomicMass: null,
  };
}
