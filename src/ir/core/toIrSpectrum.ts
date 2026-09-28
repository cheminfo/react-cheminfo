/**
 * Turning what a reader produced into what the viewer holds.
 *
 * A reader answers about a file and knows nothing about the session it is being
 * read into — which spectra are already open, what colours they took, what this
 * one should be called. That is the gap this closes, and it is the only place an
 * identity or a colour is invented.
 */

import { nextSpectrumColor } from '../../chart/core/spectrumColor.ts';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import type { IrSpectrum } from './irSpectrum.ts';

/** What has to be decided for a loaded spectrum to become a held one. */
export interface ToIrSpectrumOptions {
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
   * @default the file's title, then its name, then `spectrum`
   */
  name?: string;
  /**
   * Whether it is drawn as soon as it is added.
   * @default true
   */
  visible?: boolean;
}

/**
 * Make a held spectrum out of a read one.
 * @param loaded - What the reader produced.
 * @param options - The identity, colour and name to give it.
 * @returns The spectrum as the viewer holds it.
 */
export function toIrSpectrum(
  loaded: LoadedIrSpectrum,
  options: ToIrSpectrumOptions = {},
): IrSpectrum {
  const {
    id = crypto.randomUUID(),
    taken = [],
    name,
    visible = true,
  } = options;
  const color = options.color ?? nextSpectrumColor(taken);
  return {
    id,
    name: name ?? loaded.name ?? loaded.origin.fileName ?? 'spectrum',
    color,
    wavenumber: loaded.wavenumber,
    absorbance: loaded.absorbance,
    transmittance: loaded.transmittance,
    meta: loaded.meta,
    origin: loaded.origin,
    visible,
  };
}

/**
 * Make held spectra out of everything one file held.
 *
 * The colours are handed out one at a time against a growing list, so a file
 * carrying a sample and its background gives two spectra of two colours rather
 * than two of the same — `nextSpectrumColor` can only answer that if it is told
 * what the previous call took.
 * @param loaded - What the reader produced, in file order.
 * @param options - The colours already taken, and whether the spectra are drawn.
 * @returns The spectra, in the same order.
 */
export function toIrSpectra(
  loaded: readonly LoadedIrSpectrum[],
  options: Pick<ToIrSpectrumOptions, 'taken' | 'visible'> = {},
): IrSpectrum[] {
  const { taken = [], visible } = options;
  const colors = [...taken];
  const spectra: IrSpectrum[] = [];
  for (const entry of loaded) {
    const spectrum = toIrSpectrum(entry, {
      taken: colors,
      ...(visible === undefined ? {} : { visible }),
    });
    colors.push(spectrum.color);
    spectra.push(spectrum);
  }
  return spectra;
}
