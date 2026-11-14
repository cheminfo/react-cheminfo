/**
 * What a caption is the number of: a compound a document numbers, named by a
 * key that stays as long as the compound exists, never by its number.
 */

import { isRecord } from './values.ts';

/** The compound a label names. */
export interface LabelReferent {
  /** What names it, stable for as long as it exists; never its number. */
  key: string;
  /**
   * The molecule it labels.
   * @default undefined — a label of no structure
   */
  molecule?: string;
}

const KEY = /^[\w-]{1,64}$/;

/**
 * Whether a value can name a referent: one to 64 letters, digits, `_` or `-`.
 * @param value - The value.
 * @returns Whether it is a key.
 */
export function isReferentKey(value: unknown): value is string {
  return typeof value === 'string' && KEY.test(value);
}

/**
 * A label's compound from parsed JSON.
 * @param value - The `referent` of a caption.
 * @returns The compound, or undefined when it does not fit.
 */
export function parseLabelReferent(value: unknown): LabelReferent | undefined {
  if (!isRecord(value) || !isReferentKey(value.key)) return undefined;
  const referent: LabelReferent = { key: value.key };
  if (typeof value.molecule === 'string' && value.molecule !== '') {
    referent.molecule = value.molecule;
  }
  return referent;
}
