/**
 * Turning what a reader produced into what the viewer holds.
 *
 * A reader answers about a file and knows nothing about the session it is being
 * read into — which spectra are already open, what colours they took, what this
 * one should be called. That is the gap this closes: the peaks are picked here,
 * the resolution decided, and it is the only place an identity or a colour is
 * invented.
 */

import { nextSpectrumColor } from '../../chart/core/spectrumColor.ts';

import type { AnalyseSpectrumOptions } from './analyseSpectrum.ts';
import { analyseSpectrum } from './analyseSpectrum.ts';
import type { LoadedMassSpectrum } from './loadedMassSpectrum.ts';
import type { MassSpectrum } from './massSpectrum.ts';
import { decideResolution } from './resolutionOf.ts';

/** What has to be decided for a loaded spectrum to become a held one. */
export interface ToMassSpectrumOptions {
  /**
   * Identity, which every later edit and selection is keyed on.
   * @default a fresh UUID
   */
  id?: string;
  /**
   * The colour to draw it in.
   * @default the lowest hue not in `taken`
   */
  color?: string;
  /**
   * The colours the spectra already open have taken, so a new one is told apart
   * from them. Ignored when `color` says outright.
   * @default no colours taken
   */
  taken?: readonly string[];
  /**
   * What to call it, overriding the file's own title.
   * @default the file's title, then its name, then `Spectrum`
   */
  name?: string;
  /**
   * How the peaks are picked, beyond what the file itself said.
   * @default the analysis's own defaults
   */
  analysis?: Omit<AnalyseSpectrumOptions, 'continuous'>;
}

/**
 * Make a held spectrum out of a read one.
 *
 * The resolution is the strongest verdict there is evidence for, as
 * `decideResolution` weighs it: measured on the peak widths when the trace is a
 * profile, otherwise what the file says the instrument was, and only failing
 * both what the decimals of the masses imply.
 * @param loaded - What the reader produced.
 * @param options - The identity, colour and name to give it.
 * @returns The spectrum as the viewer holds it, its peaks picked.
 * @throws {Error} Whatever the peak picking refuses the trace with.
 */
export function toMassSpectrum(
  loaded: LoadedMassSpectrum,
  options: ToMassSpectrumOptions = {},
): MassSpectrum {
  const {
    id = crypto.randomUUID(),
    color,
    taken = [],
    name,
    analysis,
  } = options;
  const analysed = analyseSpectrum(loaded.trace, {
    ...analysis,
    ...(loaded.continuous === undefined
      ? {}
      : { continuous: loaded.continuous }),
  });
  const resolution = decideResolution({
    measured: analysed.resolution,
    meta: loaded.meta,
    masses: analysed.centroid.x,
  });
  return {
    id,
    name: name ?? loaded.name ?? loaded.origin.fileName ?? 'Spectrum',
    color: color ?? nextSpectrumColor(taken),
    profile: analysed.profile,
    centroid: analysed.centroid,
    meta: loaded.meta,
    origin: loaded.origin,
    // One trace or the other, never both: sticks standing inside the peak
    // shapes they were picked from read as a second spectrum over the first.
    showProfile: analysed.profile !== null,
    showCentroid: analysed.profile === null,
    resolution,
  };
}

/**
 * Make held spectra out of everything one file held.
 *
 * The colours are handed out one at a time against a growing list, so a file
 * carrying three scans gives three spectra of three colours rather than three
 * of the same — `nextSpectrumColor` can only answer that if it is told what the
 * previous call took.
 * @param loaded - What the reader produced, in file order.
 * @param options - The colours already taken, and how the peaks are picked.
 * @returns The spectra, in the same order.
 */
export function toMassSpectra(
  loaded: readonly LoadedMassSpectrum[],
  options: Pick<ToMassSpectrumOptions, 'taken' | 'analysis'> = {},
): MassSpectrum[] {
  const { taken = [], analysis } = options;
  const colors = [...taken];
  const spectra: MassSpectrum[] = [];
  for (const entry of loaded) {
    const spectrum = toMassSpectrum(entry, {
      taken: colors,
      ...(analysis === undefined ? {} : { analysis }),
    });
    colors.push(spectrum.color);
    spectra.push(spectrum);
  }
  return spectra;
}
