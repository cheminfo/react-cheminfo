/**
 * The kinds a measured Raman spectrum travels as: the JCAMP-DX a host keeps
 * with the bands picked on it, and those bands alone, which is what a tool
 * hands back.
 *
 * The same shape as the infrared kinds of `./irKinds.ts`, item for item and
 * rule for rule — the item's `id` is the host's reference and the bands go
 * back under it, one item is one spectrum, absent bands are not empty bands —
 * with the intensity a Raman band is read on in place of absorbance and
 * transmittance. No tool declares the bare `spectra.raman`: it would take a
 * list of bands for a spectrum.
 */

import type { BandStrength } from './bandStrength.ts';
import { BAND_STRENGTH_SCHEMA } from './bandStrength.ts';

/** One band of a Raman spectrum. */
export interface RamanPeakValue {
  /** Its Raman shift, in cm⁻¹; negative on the anti-Stokes side. */
  wavenumber: number;
  /**
   * Its intensity, in the spectrum's own units — counts, most often.
   * @default read off the spectrum
   */
  intensity?: number;
  /**
   * How strong it is, relative to the strongest band of its spectrum.
   * @default worked out from the spectrum
   */
  strength?: BandStrength;
}

/** `spectra.raman.jdx`: a measured Raman spectrum and the bands kept for it. */
export interface RamanJdxValue {
  /** The JCAMP-DX, as text. */
  jdx: string;
  /**
   * The bands the host keeps for it. Absent, none were ever picked, and the
   * tool picks its own; empty, the host kept none, and the tool keeps none.
   * @default undefined
   */
  peaks?: RamanPeakValue[];
}

/**
 * `spectra.raman.peaks`: every band of one Raman spectrum, ascending by shift,
 * one per shift. It replaces what the host kept, and travels under the `id` of
 * the spectrum it was picked on.
 */
export interface RamanPeaksValue {
  /** The bands. */
  peaks: RamanPeakValue[];
}

// Nothing is bounded: an anti-Stokes shift is negative, and a baseline-corrected
// intensity dips below zero.
const RAMAN_PEAK_SCHEMA = {
  type: 'object',
  properties: {
    wavenumber: { type: 'number' },
    intensity: { type: 'number' },
    strength: BAND_STRENGTH_SCHEMA,
  },
  required: ['wavenumber'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.raman.jdx`. */
export const RAMAN_JDX_SCHEMA = {
  type: 'object',
  properties: {
    jdx: { type: 'string' },
    peaks: { type: 'array', items: RAMAN_PEAK_SCHEMA },
  },
  required: ['jdx'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.raman.peaks`. */
export const RAMAN_PEAKS_SCHEMA = {
  type: 'object',
  properties: { peaks: { type: 'array', items: RAMAN_PEAK_SCHEMA } },
  required: ['peaks'],
  additionalProperties: false,
} as const;
