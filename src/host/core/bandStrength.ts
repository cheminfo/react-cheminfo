/**
 * How strong a band is, as the vibrational kinds — `spectra.ir.*` and
 * `spectra.raman.*` — write it: a word, relative to the strongest band of its
 * own spectrum, which is what a correlation table means by it too.
 *
 * Spelt out rather than lettered, so `s` and `S` cannot be confused and a
 * reader of the message needs no legend.
 */

/** The strengths, weakest first. */
export const BAND_STRENGTHS = ['weak', 'medium', 'strong'] as const;

/** How strong a band is, relative to the strongest band of its spectrum. */
export type BandStrength = (typeof BAND_STRENGTHS)[number];

/** The schema of a band's `strength`: one of {@link BAND_STRENGTHS}. */
export const BAND_STRENGTH_SCHEMA = {
  type: 'string',
  enum: BAND_STRENGTHS,
} as const;
