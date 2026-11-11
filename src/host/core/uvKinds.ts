/**
 * The kinds a measured UV-vis spectrum travels as: the JCAMP-DX a host keeps
 * with the maxima picked on it, and those maxima alone, which is what a tool
 * hands back.
 *
 * The same shape as the infrared kinds of `./irKinds.ts`, item for item and
 * rule for rule — the item's `id` is the host's reference and the maxima go
 * back under it, one item is one spectrum, absent maxima are not empty maxima —
 * with a band placed by its wavelength in nanometres, as the ELN stores it,
 * rather than by a wavenumber. Named after the ELN's `uv` spectra; no tool
 * declares the bare `spectra.uv`: it would take a list of maxima for a
 * spectrum.
 *
 * A fluorescence spectrum travels as the same kinds, since the ELN files it
 * under `uv` too: its maxima carry the intensity emitted rather than an
 * absorbance.
 */

import type { BandStrength } from './bandStrength.ts';
import { BAND_STRENGTH_SCHEMA } from './bandStrength.ts';

/** One maximum of a UV-vis spectrum. */
export interface UvPeakValue {
  /** Where it sits, in nm; greater than zero. */
  wavelength: number;
  /**
   * Its decadic absorbance.
   * @default read off the spectrum
   */
  absorbance?: number;
  /**
   * Its transmittance, as a fraction — `0.42`, not `42`.
   * @default read off the spectrum
   */
  transmittance?: number;
  /**
   * The intensity emitted, for a maximum of a fluorescence spectrum, in the
   * instrument's own units.
   * @default read off the spectrum
   */
  intensity?: number;
  /**
   * How strong it is, relative to the strongest band of its spectrum.
   * @default worked out from the spectrum
   */
  strength?: BandStrength;
}

/** `spectra.uv.jdx`: a measured UV-vis spectrum and the maxima kept for it. */
export interface UvJdxValue {
  /** The JCAMP-DX, as text. */
  jdx: string;
  /**
   * The maxima the host keeps for it. Absent, none were ever picked, and the
   * tool picks its own; empty, the host kept none, and the tool keeps none.
   * @default undefined
   */
  peaks?: UvPeakValue[];
}

/**
 * `spectra.uv.peaks`: every maximum of one UV-vis spectrum, ascending by
 * wavelength, one per wavelength. It replaces what the host kept, and travels
 * under the `id` of the spectrum it was picked on.
 */
export interface UvPeaksValue {
  /** The maxima. */
  peaks: UvPeakValue[];
}

// Only the wavelength is bounded: a measured baseline dips below zero
// absorbance and above full transmittance.
const UV_PEAK_SCHEMA = {
  type: 'object',
  properties: {
    wavelength: { type: 'number', exclusiveMinimum: 0 },
    absorbance: { type: 'number' },
    transmittance: { type: 'number' },
    intensity: { type: 'number' },
    strength: BAND_STRENGTH_SCHEMA,
  },
  required: ['wavelength'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.uv.jdx`. */
export const UV_JDX_SCHEMA = {
  type: 'object',
  properties: {
    jdx: { type: 'string' },
    peaks: { type: 'array', items: UV_PEAK_SCHEMA },
  },
  required: ['jdx'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.uv.peaks`. */
export const UV_PEAKS_SCHEMA = {
  type: 'object',
  properties: { peaks: { type: 'array', items: UV_PEAK_SCHEMA } },
  required: ['peaks'],
  additionalProperties: false,
} as const;
