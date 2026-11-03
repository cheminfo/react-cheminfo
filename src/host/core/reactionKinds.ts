/**
 * The kind a reaction travels as: an MDL RXN file, which is what SciPeaks
 * keeps for a reaction (`$content.reactionRXN`), what OpenChemLib's reaction
 * editor writes, and what a structure editor of the family hands back.
 *
 * Named after pipeline's `chem.molfile`, whose value is the file's text under
 * the name of its format.
 */

/** `chem.rxn`: a reaction, as an RXN file, V2000 or V3000. */
export interface RxnValue {
  /** The RXN file, as text. */
  rxn: string;
}

/** The kinds a reaction input accepts, in order of preference. */
export const REACTION_KINDS = ['chem.rxn'] as const;

/** The schema of `chem.rxn`. */
export const RXN_SCHEMA = {
  type: 'object',
  properties: { rxn: { type: 'string' } },
  required: ['rxn'],
  additionalProperties: false,
} as const;
