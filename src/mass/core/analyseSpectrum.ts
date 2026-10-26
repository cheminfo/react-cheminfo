/**
 * The one place a raw trace meets `ms-spectrum`.
 *
 * Whether a trace is a profile or a peak table, where its peaks are, what
 * charge each carries and how wide they are all come out of `ms-spectrum`'s
 * `Spectrum`, once, when a trace is read — everything downstream reads a
 * `MassSpectrum` and never a `Spectrum`. A profile is peak picked by `ml-gsd`
 * through it; a peak table is taken as it stands, each point a peak.
 *
 * Intensities leave here on a 0–100 scale. Two spectra acquired an hour apart
 * are compared by shape and never by counts, so normalising once at the door is
 * what lets a label threshold and a table floor mean the same thing whichever
 * file they were read from.
 */

import { xMaxValue, xNormed } from 'ml-spectra-processing';
import { Spectrum } from 'ms-spectrum';

import type { MassResolution } from './massResolution.ts';
import { measuredResolution } from './massResolution.ts';
import type { MassPeaks, MassTrace } from './massSpectrum.ts';

/** How the trace is read, where the file knows better than the arithmetic. */
export interface AnalyseSpectrumOptions {
  /**
   * Whether the trace is a continuous profile, overriding what the spacing of
   * the points says. `ms-spectrum` calls anything under a hundred points a
   * centroid, which is right for a two-column paste and wrong for a short
   * profile out of a file that said so in its own header — a reader that read
   * the answer says it here rather than being second-guessed.
   * @default undefined — the spacing of the points decides
   */
  continuous?: boolean;
  /**
   * Fraction of the base peak under which a maximum of a profile is not a peak.
   * @default 0.00025
   */
  threshold?: number;
  /**
   * How many noise standard deviations above the noise median a maximum has to
   * rise before the peak picking believes it. `0` lets the peak picking decide.
   * @default 3
   */
  noiseFactor?: number;
  /**
   * The charge carriers a charge-state ladder may be built from, as `mf-parser`
   * reads them: `'H+,Na+'`. Only ladders use them — an isotopologue cluster
   * shows its charge through its spacing, whatever carried it.
   * @default 'H+'
   */
  ionizations?: string;
  /**
   * Highest charge to look for, left to `ms-spectrum` when unset: it decides a
   * charge on whether the series a peak belongs to is as long as the mass that
   * charge would imply, which a ceiling here could only restrict.
   * @default 100
   */
  maxCharge?: number;
}

/** The two traces of one measurement, and what the peak widths said. */
export interface AnalysedSpectrum {
  /** The continuous trace, `null` when what was read was already centroided. */
  profile: MassTrace | null;
  /** The picked peaks, each carrying the charge of the series it belongs to. */
  centroid: MassPeaks;
  /**
   * The resolution measured on the widths of the picked peaks, `null` for a
   * peak table, which has no widths to measure.
   */
  resolution: MassResolution | null;
}

/**
 * Turn a raw trace into the two traces a spectrum is drawn from.
 *
 * The profile shares the very `x` it was handed, only `y` being fresh, so a
 * caller that rescales masses has to clone first rather than write into the
 * trace it kept.
 *
 * The charges come out of a single pass over all the peaks, because a charge is
 * never readable off one peak: it is the spacing of an isotopologue cluster
 * (0.5 apart means doubly charged) or the rungs of a charge-state ladder that
 * says so, and a peak belonging to neither honestly has no charge.
 * @param trace - The measurement as it was read, m/z ascending.
 * @param options - What the file already knows, and how hard to look.
 * @returns The profile, when there is one, the picked peaks and the resolution
 * their widths imply.
 * @throws {RangeError} When the trace carries a different number of masses and
 * intensities.
 */
export function analyseSpectrum(
  trace: MassTrace,
  options: AnalyseSpectrumOptions = {},
): AnalysedSpectrum {
  const {
    continuous,
    threshold = 0.00025,
    noiseFactor = 3,
    ionizations = 'H+',
    maxCharge,
  } = options;
  const length = trace.x.length;
  if (trace.y.length !== length) {
    throw new RangeError(
      `The trace carries ${length} masses but ${trace.y.length} intensities; every mass needs its own intensity`,
    );
  }
  if (length === 0) {
    return { profile: null, centroid: emptyPeaks(), resolution: null };
  }

  const y = normalise(trace.y);
  // `Spectrum` shallow-copies the object it is handed and reads both columns
  // through plain indexing, so the typed arrays go in as they are — a profile
  // scan runs to hundreds of thousands of points, and converting it to two
  // plain arrays would be the largest allocation of the whole load.
  const spectrum = new Spectrum(
    { x: trace.x, y },
    { threshold, noiseFactor, ionizations },
  );
  // `isContinuous` answers from `continuous` whenever it is already set, which
  // is the only way to tell it what the file said about itself.
  if (continuous !== undefined) spectrum.continuous = continuous;

  const isProfile = spectrum.isContinuous() as boolean;
  // The charges are cached inside `Spectrum` only for an empty options object,
  // so nothing is passed unless there is something to say.
  const peaks = spectrum.getPeaksWithCharge(
    maxCharge === undefined ? {} : { max: maxCharge },
  ) as PickedPeak[];

  const count = peaks.length;
  const centroid: MassPeaks = {
    x: new Float64Array(count),
    y: new Float64Array(count),
    charge: new Int16Array(count),
  };
  for (let index = 0; index < count; index++) {
    const peak = peaks[index] as PickedPeak;
    centroid.x[index] = peak.x;
    centroid.y[index] = peak.y;
    centroid.charge[index] = peak.charge ?? 0;
  }

  return {
    profile: isProfile ? { x: trace.x, y } : null,
    centroid,
    resolution: isProfile ? measuredResolution(peaks) : null,
  };
}

/** One peak as `ms-spectrum` hands it back. */
interface PickedPeak {
  /** Where it sits, in m/z. */
  x: number;
  /** Its intensity, on the scale the trace was handed in on. */
  y: number;
  /** Its width between inflection points, `0` for a point of a peak table. */
  width: number;
  /**
   * The charge of the series it belongs to, absent where none was established.
   * @default undefined
   */
  charge?: number;
}

/**
 * The centroid of a spectrum holding nothing.
 * @returns Three empty columns.
 */
function emptyPeaks(): MassPeaks {
  return {
    x: new Float64Array(0),
    y: new Float64Array(0),
    charge: new Int16Array(0),
  };
}

/**
 * The intensities on the 0–100 scale everything downstream assumes.
 * @param intensities - The intensities as they were read.
 * @returns A fresh array, all zeros when the trace carries no signal at all.
 */
function normalise(intensities: Float64Array): Float64Array {
  const output = new Float64Array(intensities.length);
  // `xNormed` refuses to divide by zero, and a trace of zeros is a legitimate
  // thing to be handed — an empty scan of a chromatographic run.
  if (xMaxValue(intensities) <= 0) return output;
  return xNormed(intensities, { algorithm: 'max', value: 100, output });
}
