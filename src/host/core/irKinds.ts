/**
 * The kinds a measured infrared spectrum travels as: the JCAMP-DX a notebook
 * keeps with the bands picked on it, and those bands alone, which is what a
 * tool hands back.
 *
 * Shaped on what SciPeaks keeps for a sample's infrared spectrum — a JCAMP-DX
 * attachment and a `peak` list beside it — with the text of the attachment in
 * place of its address, since a tool framed from another origin cannot fetch
 * what the notebook serves its own pages. A band is written the way SciPeaks
 * and `ir-spectrum` write one, so what a tool hands back can be stored as it
 * arrives.
 *
 * Named after pipeline's `spectra.nmr.1d.jdx`. Pipeline's own `spectra.ir` is
 * a computed spectrum — normal modes, not a measurement — and is not one of the
 * kinds read here.
 */

/** One band of an infrared spectrum, as SciPeaks and `ir-spectrum` write it. */
export interface IrPeakValue {
  /** Where it sits, in cm⁻¹. */
  wavenumber: number;
  /**
   * Its absorbance.
   * @default read off the spectrum
   */
  absorbance?: number;
  /**
   * Its transmittance, as a fraction between 0 and 1 — not a percentage.
   * @default read off the spectrum
   */
  transmittance?: number;
  /**
   * How strong it is: `w` weak, `m` medium, `S` strong. Any other letter is
   * worked out again from the spectrum.
   * @default worked out from the spectrum
   */
  kind?: string;
}

/** `spectra.ir.jdx`: a measured infrared spectrum and the bands picked on it. */
export interface IrJdxValue {
  /** The JCAMP-DX, as text. */
  jdx: string;
  /**
   * The name the notebook keeps it under, e.g. `spectra/ir/sample.jdx`.
   * @default undefined
   */
  filename?: string;
  /**
   * The bands picked on it. Absent or empty, the tool picks them itself.
   * @default undefined
   */
  peaks?: IrPeakValue[];
}

/** `spectra.ir.peaks`: the bands picked on an infrared spectrum, alone. */
export interface IrPeaksValue {
  /** The bands, ascending by wavenumber. */
  peaks: IrPeakValue[];
}

const IR_PEAK_SCHEMA = {
  type: 'object',
  properties: {
    wavenumber: { type: 'number' },
    absorbance: { type: 'number' },
    transmittance: { type: 'number' },
    kind: { type: 'string' },
  },
  required: ['wavenumber'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.ir.jdx`. */
export const IR_JDX_SCHEMA = {
  type: 'object',
  properties: {
    jdx: { type: 'string' },
    filename: { type: 'string' },
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
