import type { MFResult } from 'mf-finder';

import type { ElementRange } from './elementRanges.ts';
import {
  DEFAULT_ELEMENT_RANGES,
  formatElementRanges,
} from './elementRanges.ts';

/**
 * The window a formula lookup enumerates, in ppm. It is wide on purpose: the
 * accuracy a spectrum was measured at is read off the ppm of each formula, so
 * the window only has to hold the closest ones as a list rather than act as a
 * filter.
 */
export const FORMULA_LOOKUP_PRECISION = 500;

/** How many formulas a lookup lists, closest first. */
export const FORMULA_LOOKUP_LIMIT = 100;

/** A molecular formula whose monoisotopic mass is near the one searched. */
export interface FormulaCandidate {
  /** The formula of the neutral molecule: `C10H14O`. */
  mf: string;
  /** Its monoisotopic mass, in Da. */
  em: number;
  /** Its unsaturation: rings plus double bonds. */
  unsaturation: number;
  /** How far the searched mass is from it, in ppm; positive when heavier. */
  ppm: number;
}

/** The formulas a search kept, and how many fit. */
export interface FormulaCandidates {
  /** The closest formulas, closest first. */
  candidates: FormulaCandidate[];
  /** How many formulas fit the window, the ones left out included. */
  total: number;
}

/** What {@link findFormulaCandidates} searches. */
export interface FormulaCandidateOptions {
  /**
   * The elements, and how many atoms of each a formula may carry.
   * @default DEFAULT_ELEMENT_RANGES
   */
  ranges?: readonly ElementRange[];
  /**
   * The window around the mass, in ppm.
   * @default FORMULA_LOOKUP_PRECISION
   */
  precision?: number;
  /**
   * How many formulas are kept, closest first.
   * @default FORMULA_LOOKUP_LIMIT
   */
  limit?: number;
}

/**
 * The neutral molecular formulas whose monoisotopic mass lies within the
 * window of a mass, closest first. Only formulas with a whole, non-negative
 * unsaturation are kept: a neutral, even-electron molecule has no other.
 *
 * `mf-finder` is loaded on the first search, so a page that only draws
 * formulas never downloads it.
 * @param mass - The monoisotopic mass of the neutral molecule, in Da.
 * @param options - See {@link FormulaCandidateOptions}.
 * @returns The closest formulas, and how many fit the window.
 */
export async function findFormulaCandidates(
  mass: number,
  options: FormulaCandidateOptions = {},
): Promise<FormulaCandidates> {
  const {
    ranges = DEFAULT_ELEMENT_RANGES,
    precision = FORMULA_LOOKUP_PRECISION,
    limit = FORMULA_LOOKUP_LIMIT,
  } = options;
  const range = formatElementRanges(ranges);
  const kept = Math.floor(limit);
  if (!Number.isFinite(mass) || mass <= 0 || range === '' || !(kept > 0)) {
    return { candidates: [], total: 0 };
  }
  const { findMFs } = await import('mf-finder');
  // Declared as an array of results, `findMFs` resolves to `{ mfs, info }`.
  const found = (await findMFs(mass, {
    ranges: range,
    precision,
    limit: kept,
    // Without it, a formula with no charge is never compared to the mass.
    allowNeutral: true,
    filter: { unsaturation: { min: 0, onlyInteger: true } },
  })) as unknown as FinderAnswer;
  const candidates: FormulaCandidate[] = [];
  for (const result of found.mfs) {
    candidates.push({
      mf: result.mf,
      em: result.em,
      unsaturation: result.unsaturation,
      ppm: result.ms.ppm,
    });
  }
  return { candidates, total: found.info.numberResults };
}

interface FinderAnswer {
  mfs: MFResult[];
  info: { numberResults: number };
}
