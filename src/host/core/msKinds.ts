/**
 * The kinds a mass spectrum and the ions looked for in it travel as: the
 * measured spectrum, as its JCAMP-DX; the ions a host expects to find in it —
 * the fragments a drawing cuts a molecule into, each with its m/z — and, coming
 * back, the peak each of those ions was found at.
 *
 * The spectrum travels as the infrared and Raman ones do (`./irKinds.ts`): the
 * text of the file rather than its address, since a tool framed from another
 * origin cannot fetch what the host serves its own pages. Its peaks do not
 * travel: a tool picks them again from the spectrum.
 *
 * An ion is named by the host, and comes back under that name with the peak it
 * was found at, so the host knows which of its fragments the spectrum shows.
 * An ion found at no peak does not come back. No tool declares the bare
 * `spectra.ms`: it would take a list of ions for a spectrum.
 */

/** `spectra.ms.jdx`: a measured mass spectrum. */
export interface MsJdxValue {
  /** The JCAMP-DX, as text: a profile, or a peak table. */
  jdx: string;
}

/** One ion a host expects to find in a mass spectrum. */
export interface MsIonValue {
  /** The host's name for it, which the peak it is found at comes back under. */
  id: string;
  /** Its m/z; greater than zero. */
  mz: number;
  /**
   * Its formula with its charge, in mf-parser notation: `C7H7O(+1)`.
   * @default undefined — the tool writes its m/z alone
   */
  mf?: string;
  /**
   * Whether it carries an unpaired electron: a radical cation.
   * @default false
   */
  radical?: boolean;
  /**
   * What the host calls it, e.g. `Cleavage 2`.
   * @default undefined
   */
  label?: string;
}

/** `spectra.ms.ions`: the ions a host expects to find in a mass spectrum. */
export interface MsIonsValue {
  /** The ions, in the host's order. */
  ions: MsIonValue[];
}

/** One ion found in a mass spectrum, and the peak it was found at. */
export interface MsAssignmentValue {
  /** The `id` of the ion, as the host named it. */
  id: string;
  /** The m/z of the peak. */
  mz: number;
  /** The peak's intensity, in percent of the tallest peak of its spectrum. */
  intensity: number;
}

/**
 * `spectra.ms.assignments`: every ion of the host's that the spectrum shows,
 * each at one peak. It replaces what the tool sent before.
 */
export interface MsAssignmentsValue {
  /** The ions found, in the host's order. */
  assignments: MsAssignmentValue[];
}

/** The schema of `spectra.ms.jdx`. */
export const MS_JDX_SCHEMA = {
  type: 'object',
  properties: { jdx: { type: 'string' } },
  required: ['jdx'],
  additionalProperties: false,
} as const;

const MS_ION_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    mz: { type: 'number', exclusiveMinimum: 0 },
    mf: { type: 'string' },
    radical: { type: 'boolean' },
    label: { type: 'string' },
  },
  required: ['id', 'mz'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.ms.ions`. */
export const MS_IONS_SCHEMA = {
  type: 'object',
  properties: { ions: { type: 'array', items: MS_ION_SCHEMA } },
  required: ['ions'],
  additionalProperties: false,
} as const;

const MS_ASSIGNMENT_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    mz: { type: 'number', exclusiveMinimum: 0 },
    intensity: { type: 'number', minimum: 0, maximum: 100 },
  },
  required: ['id', 'mz', 'intensity'],
  additionalProperties: false,
} as const;

/** The schema of `spectra.ms.assignments`. */
export const MS_ASSIGNMENTS_SCHEMA = {
  type: 'object',
  properties: {
    assignments: { type: 'array', items: MS_ASSIGNMENT_SCHEMA },
  },
  required: ['assignments'],
  additionalProperties: false,
} as const;
