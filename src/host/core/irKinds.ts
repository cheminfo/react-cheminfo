/**
 * The kinds a measured infrared spectrum travels as: the JCAMP-DX a host keeps
 * with the bands picked on it, and those bands alone, which is what a tool
 * hands back.
 *
 * The value carries the data and the item names it: the item's `id` is the
 * host's own reference to the spectrum — the bands go back under it — and its
 * `label` is what the tool shows. One item is one spectrum: when its JCAMP-DX
 * holds several, the bands belong to the first. The text of the file travels
 * rather than its address, since a tool framed from another origin cannot
 * fetch what the host serves its own pages.
 *
 * Named after pipeline's `spectra.nmr.1d.jdx`. Pipeline's own `spectra.ir` is
 * a computed spectrum — normal modes, not a measurement — so no tool declares
 * the bare `spectra.ir`: it would take a list of bands for a spectrum.
 */

import type { BandStrength } from './bandStrength.ts';
import { BAND_STRENGTH_SCHEMA } from './bandStrength.ts';

/** One band of an infrared spectrum. */
export interface IrPeakValue {
  /** Where it sits, in cm⁻¹; greater than zero. */
  wavenumber: number;
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
   * How strong it is, relative to the strongest band of its spectrum.
   * @default worked out from the spectrum
   */
  strength?: BandStrength;
}

/** `spectra.ir.jdx`: a measured infrared spectrum and the bands kept for it. */
export interface IrJdxValue {
  /** The JCAMP-DX, as text. */
  jdx: string;
  /**
   * The bands the host keeps for it. Absent, none were ever picked, and the
   * tool picks its own; empty, the host kept none, and the tool keeps none.
   * @default undefined
   */
  peaks?: IrPeakValue[];
}

/**
 * `spectra.ir.peaks`: every band of one infrared spectrum, ascending by
 * wavenumber, one per wavenumber. It replaces what the host kept, and travels
 * under the `id` of the spectrum it was picked on.
 */
export interface IrPeaksValue {
  /** The bands. */
  peaks: IrPeakValue[];
}

// Written as plain schemas rather than `JSONSchemaType`, which would demand
// `nullable` on every optional field and so let a `null` band through. No
// value is bounded but the wavenumber: a measured baseline dips below zero
// absorbance and above full transmittance.
const IR_PEAK_SCHEMA = {
  type: 'object',
  properties: {
    wavenumber: { type: 'number', exclusiveMinimum: 0 },
    absorbance: { type: 'number' },
    transmittance: { type: 'number' },
    strength: BAND_STRENGTH_SCHEMA,
  },
  required: ['wavenumber'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.ir.jdx`. */
export const IR_JDX_SCHEMA = {
  type: 'object',
  properties: {
    jdx: { type: 'string' },
    peaks: { type: 'array', items: IR_PEAK_SCHEMA },
  },
  required: ['jdx'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.ir.peaks`. */
export const IR_PEAKS_SCHEMA = {
  type: 'object',
  properties: { peaks: { type: 'array', items: IR_PEAK_SCHEMA } },
  required: ['peaks'],
  additionalProperties: false,
} as const;
