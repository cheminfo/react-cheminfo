/**
 * The kind a peptide or a protein travels as: its sequence as text, which the
 * tool reads itself — the notation a chemist writes (`BocGlyAlaOBn`,
 * `H-Val-Leu-OH`), one-letter or three-letter code, or the whole text of the
 * FASTA or PDB file the host keeps it in. Reading the file is the tool's
 * business, so a host hands over what it holds without converting anything.
 *
 * Named after pipeline's `chem.molfile`, whose value is the text under the name
 * of what it is.
 */

/** `chem.peptide`: a peptide or a protein, as text the tool reads. */
export interface PeptideValue {
  /** The sequence, in any notation the tool reads, or a FASTA or PDB file. */
  sequence: string;
}

/** The kinds a peptide input accepts, in order of preference. */
export const PEPTIDE_KINDS = ['chem.peptide'] as const;

/** The schema of `chem.peptide`: a sequence is never empty. */
export const PEPTIDE_SCHEMA = {
  type: 'object',
  properties: { sequence: { type: 'string', minLength: 1 } },
  required: ['sequence'],
  additionalProperties: false,
} as const;
