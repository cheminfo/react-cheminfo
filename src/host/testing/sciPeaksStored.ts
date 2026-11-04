/**
 * A spectrum's bands as SciPeaks stores them, and as visualizer-helper's tool
 * tab is to send them: the translation its `ir` and `raman` readers make, which
 * `./sciPeaksIr.ts` and `./sciPeaksRaman.ts` pin for one sample.
 *
 * - the attachment's name becomes the item's `id`, which the bands come back
 *   under, and its last segment the item's `label`;
 * - the attachment's text becomes `jdx`;
 * - a band's `kind` letter becomes its `strength` — `w` weak, `m` medium, `S`
 *   strong, any other letter left out for the tool to work out — and the
 *   visualizer's `_highlight` is dropped;
 * - a spectrum without a `peak` list goes without `peaks`, never with an empty
 *   one, so the tool picks its own rather than keeping none.
 */

import type { BandStrength } from '../core/bandStrength.ts';
import type { IrPeakValue } from '../core/irKinds.ts';
import type { RamanPeakValue } from '../core/ramanKinds.ts';

/** A band as SciPeaks stores it: a strength letter and a `_highlight`. */
export interface StoredPeak {
  wavenumber: number;
  kind: string;
  _highlight: number;
}

/** An infrared band as SciPeaks stores it. */
export interface StoredIrPeak extends StoredPeak {
  absorbance: number;
  transmittance: number;
}

/** A Raman band as SciPeaks stores it. */
export interface StoredRamanPeak extends StoredPeak {
  intensity: number;
}

/**
 * One infrared band as SciPeaks stores it.
 * @param wavenumber - Where it sits, in cm⁻¹.
 * @param absorbance - Its absorbance.
 * @param transmittance - Its transmittance, a fraction.
 * @param kind - Its strength letter.
 * @param highlight - The visualizer's own `_highlight`.
 * @returns The band.
 */
export function storedIrPeak(
  wavenumber: number,
  absorbance: number,
  transmittance: number,
  kind: string,
  highlight: number,
): StoredIrPeak {
  return { wavenumber, absorbance, transmittance, kind, _highlight: highlight };
}

/**
 * One Raman band as SciPeaks stores it.
 * @param wavenumber - Its shift, in cm⁻¹.
 * @param intensity - Its intensity, in counts.
 * @param kind - Its strength letter.
 * @param highlight - The visualizer's own `_highlight`.
 * @returns The band.
 */
export function storedRamanPeak(
  wavenumber: number,
  intensity: number,
  kind: string,
  highlight: number,
): StoredRamanPeak {
  return { wavenumber, intensity, kind, _highlight: highlight };
}

/**
 * An infrared band as the tool tab's `ir` reader sends it.
 * @param stored - The band as stored.
 * @returns The band as sent.
 */
export function sentIrPeak(stored: StoredIrPeak): IrPeakValue {
  const { wavenumber, absorbance, transmittance, kind } = stored;
  return { wavenumber, absorbance, transmittance, ...strengthOf(kind) };
}

/**
 * A Raman band as the tool tab's `raman` reader sends it.
 * @param stored - The band as stored.
 * @returns The band as sent.
 */
export function sentRamanPeak(stored: StoredRamanPeak): RamanPeakValue {
  const { wavenumber, intensity, kind } = stored;
  return { wavenumber, intensity, ...strengthOf(kind) };
}

function strengthOf(letter: string): { strength?: BandStrength } {
  const strength = STRENGTHS.get(letter);
  return strength === undefined ? {} : { strength };
}

const STRENGTHS = new Map<string, BandStrength>([
  ['w', 'weak'],
  ['m', 'medium'],
  ['S', 'strong'],
]);
