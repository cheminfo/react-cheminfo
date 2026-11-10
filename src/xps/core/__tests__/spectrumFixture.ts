/**
 * The spectra the chart's tests are drawn from.
 *
 * One builder rather than a copy in each test file: an `XpsSpectrum` carries
 * fifteen fields and only three of them are ever the subject of a chart test, so
 * a literal per test would bury the one number that matters under a dozen that
 * do not — and would have to be revisited in a dozen places the next time the
 * model gains a field.
 */

import { convertEnergyAxis } from '../energy.ts';
import type {
  XpsComponent,
  XpsPeak,
  XpsRegion,
  XpsSpectrum,
} from '../xpsSpectrum.ts';

/** What a test wants to say about a spectrum, everything else being usual. */
export interface SpectrumFixtureOptions {
  /**
   * The energies in eV of binding energy, ascending.
   * @default [280, 285, 290]
   */
  energy?: number[];
  /**
   * The counts, one per energy.
   * @default [100, 500, 200]
   */
  counts?: number[];
  /**
   * The photon energy in eV, `null` for a file that states none — which is what
   * puts the spectrum on the kinetic axis whatever the settings say.
   * @default 1000
   */
  sourceEnergy?: number | null;
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
   * Whether the trace is drawn.
   * @default true
   */
  visible?: boolean;
  /**
   * Whether the trace is left out of the automatic window.
   * @default false
   */
  excludeFromDomain?: boolean;
}

/**
 * A spectrum as a chart test wants one.
 *
 * The kinetic trace is derived rather than given, exactly as a reader derives
 * it: `sourceEnergy − binding`, which reverses the order of the array, so any
 * test drawing on the kinetic axis meets the descending x a real file produces.
 * @param id - Its identity, which is also its name.
 * @param options - What this test wants to say about it.
 * @returns The spectrum.
 */
export function spectrumFixture(
  id: string,
  options: SpectrumFixtureOptions = {},
): XpsSpectrum {
  const {
    energy = [280, 285, 290],
    counts = [100, 500, 200],
    sourceEnergy = 1000,
    peaks = [],
    components = [],
    regions = [],
    visible = true,
    excludeFromDomain = false,
  } = options;

  const x = Float64Array.from(energy);
  const y = Float64Array.from(counts);
  const kinetic =
    sourceEnergy === null ? null : { x: convertEnergyAxis(x, sourceEnergy), y };

  return {
    id,
    name: id,
    color: '#1f77b4',
    energy: { x, y },
    kinetic,
    sourceEnergy,
    transition: {
      name: 'C 1s',
      element: 'C',
      shell: 1,
      angularMomentum: 's',
      augerElement: null,
      augerTransition: null,
    },
    peaks,
    components,
    regions,
    meta: null,
    origin: { format: 'vamas' },
    visible,
    excludeFromDomain,
  };
}

/**
 * One picked peak.
 * @param id - Its identity.
 * @param bindingEnergy - Where the maximum sits, in eV.
 * @param intensity - The counts there.
 * @returns The peak, half an eV wide.
 */
export function peakFixture(
  id: string,
  bindingEnergy: number,
  intensity: number,
): XpsPeak {
  return { id, bindingEnergy, intensity, width: 0.5 };
}

/**
 * One fitted component.
 * @param id - Its identity.
 * @param bindingEnergy - Where it sits, in eV.
 * @param area - Area under it.
 * @param shape - The shape, as a file names it. Defaults to `GL(30)`.
 * @returns The component, one eV wide.
 */
export function componentFixture(
  id: string,
  bindingEnergy: number,
  area: number,
  shape = 'GL(30)',
): XpsComponent {
  return {
    id,
    label: id,
    bindingEnergy,
    kineticEnergy: null,
    area,
    fwhm: 1,
    shape,
    relativeSensitivityFactor: null,
    atomicMass: null,
    regionId: null,
  };
}

/**
 * One region a background was drawn under.
 * @param id - Its identity.
 * @param from - Lower bound in eV of binding energy.
 * @param to - Upper bound.
 * @returns The region.
 */
export function regionFixture(id: string, from: number, to: number): XpsRegion {
  return {
    id,
    label: id,
    backgroundType: 'Shirley',
    from,
    to,
    relativeSensitivityFactor: null,
    atomicMass: null,
  };
}
