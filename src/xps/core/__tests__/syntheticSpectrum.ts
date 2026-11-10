/**
 * Spectra built by hand, so the arithmetic is tested against numbers chosen for
 * the test rather than against a file.
 *
 * Nothing here is a real sample. A background, an integration and a composition
 * take a trace and a few numbers and know nothing else, so a test reading a
 * VAMAS file would be testing the reader instead of the arithmetic — and would
 * have no exact answer to assert against, which is the whole point of building
 * the trace from a Gaussian whose area is known.
 */

import type {
  XpsComponent,
  XpsSpectrum,
  XpsTrace,
  XpsTransition,
} from '../xpsSpectrum.ts';

/** One Gaussian laid on a synthetic trace. */
export interface SyntheticPeak {
  /** Where it sits, in eV of binding energy. */
  center: number;
  /** Counts at its maximum. */
  height: number;
  /** Full width at half maximum, in eV. */
  fwhm: number;
}

/** The window a synthetic trace is built over, and what is under the peaks. */
export interface SyntheticTraceOptions {
  /**
   * Lowest binding energy in eV.
   * @default 280
   */
  from?: number;
  /**
   * Highest binding energy in eV.
   * @default 290
   */
  to?: number;
  /**
   * How many points, ends included.
   * @default 501
   */
  points?: number;
  /**
   * Counts under everything, whatever the energy.
   * @default 0
   */
  baseline?: number;
  /**
   * Counts added per eV of binding energy above `from`, so a window can be
   * given the sloping baseline a real one has.
   * @default 0
   */
  slope?: number;
}

/** What a synthetic component states about itself. */
export interface SyntheticComponentOptions {
  /**
   * The factor its area is divided by, `null` when the file states none.
   * @default null
   */
  relativeSensitivityFactor?: number | null;
  /**
   * Where it sits, in eV of binding energy.
   * @default 284.6
   */
  bindingEnergy?: number;
}

/** What a synthetic spectrum says about the scan the components came from. */
export interface SyntheticSpectrumOptions {
  /**
   * Element of the core level the block was scanned over, `null` for a survey.
   * @default null
   */
  element?: string | null;
  /**
   * The trace it carries.
   * @default a flat window of ten points
   */
  energy?: XpsTrace;
}

/**
 * A trace with the given Gaussians on it, sampled on an even grid.
 * @param peaks - The Gaussians, in any order.
 * @param options - The window, and the baseline under it.
 * @returns The trace, x ascending in binding energy.
 */
export function syntheticTrace(
  peaks: readonly SyntheticPeak[],
  options: SyntheticTraceOptions = {},
): XpsTrace {
  const {
    from = 280,
    to = 290,
    points = 501,
    baseline = 0,
    slope = 0,
  } = options;
  const x = new Float64Array(points);
  const y = new Float64Array(points);
  const step = points > 1 ? (to - from) / (points - 1) : 0;

  for (let index = 0; index < points; index++) {
    const energy = from + step * index;
    x[index] = energy;
    let counts = baseline + slope * (energy - from);
    for (const peak of peaks) {
      const sigma = peak.fwhm / FWHM_PER_SIGMA;
      const offset = (energy - peak.center) / sigma;
      counts += peak.height * Math.exp(-0.5 * offset * offset);
    }
    y[index] = counts;
  }
  return { x, y };
}

/**
 * A flat trace, the case every background has an exact answer for.
 * @param level - The counts at every point.
 * @param options - The window it is built over.
 * @returns The trace.
 */
export function flatTrace(
  level: number,
  options: SyntheticTraceOptions = {},
): XpsTrace {
  return syntheticTrace([], { ...options, baseline: level });
}

/**
 * One fitted component, with only what the composition reads filled in.
 * @param label - What the fit calls it.
 * @param area - Area under it, in the file's own units.
 * @param options - The sensitivity factor it states, and where it sits.
 * @returns The component.
 */
export function syntheticComponent(
  label: string,
  area: number,
  options: SyntheticComponentOptions = {},
): XpsComponent {
  const { relativeSensitivityFactor = null, bindingEnergy = 284.6 } = options;
  return {
    id: `component-${label}`,
    label,
    bindingEnergy,
    kineticEnergy: null,
    area,
    fwhm: 1.2,
    shape: 'GL(30)',
    relativeSensitivityFactor,
    atomicMass: null,
    regionId: null,
  };
}

/**
 * One spectrum carrying the given components, and nothing else of interest.
 *
 * It states no source energy, so it has the one axis it was built on and no
 * kinetic trace beside it — nothing a composition reads depends on either.
 * @param id - Identity, which the entries are traced back to.
 * @param components - What it was fitted with.
 * @param options - What the scan was of, and the trace it carries.
 * @returns The spectrum.
 */
export function syntheticSpectrum(
  id: string,
  components: XpsComponent[],
  options: SyntheticSpectrumOptions = {},
): XpsSpectrum {
  const { element = null, energy = flatTrace(0, { points: 10 }) } = options;
  const transition: XpsTransition = {
    name: element === null ? 'Survey' : `${element} 1s`,
    element,
    shell: element === null ? null : 1,
    angularMomentum: element === null ? null : 's',
    augerElement: null,
    augerTransition: null,
  };
  return {
    id,
    name: id,
    color: '#000000',
    energy,
    kinetic: null,
    sourceEnergy: null,
    transition,
    peaks: [],
    components,
    regions: [],
    meta: null,
    origin: { format: 'calculated' },
    visible: true,
  };
}

/** How many standard deviations wide a Gaussian is at half its height. */
const FWHM_PER_SIGMA = 2 * Math.sqrt(2 * Math.LN2);
