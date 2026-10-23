/**
 * One formula written several ways: canonically, so two spellings compare
 * equal; as HTML, so a paste keeps its subscripts; in Unicode, for prose.
 */

import { MF, ensureCase } from 'mf-parser';

import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';

import { normalizeFormula } from './normalizeFormula.ts';
import type { FormulaOptions, ParsedFormula } from './readFormula.ts';
import { FormulaError, parserMessage } from './readFormula.ts';

/** What {@link canonicalFormula} is told beyond the text. */
export interface CanonicalFormulaOptions extends FormulaOptions {
  /**
   * Whether a formula typed in the wrong case is fixed first, so `c9h6n4`
   * reads as `C9H6N4`. A tool reading exact isotopes and charges leaves it
   * off: case is what tells `Co` from `CO`.
   * @default false
   */
  fixCase?: boolean;
}

/**
 * The canonical spelling of a formula, so two spellings of one compound
 * compare equal: `NaOH`, `HONa` and `NaHO` all give the same string.
 * @param text - A formula as typed.
 * @param options - Whether the case is fixed, and the language of a failure.
 * @returns The canonical formula.
 * @throws {FormulaError} When the text is not a formula.
 */
export function canonicalFormula(
  text: string,
  options: CanonicalFormulaOptions = {},
): string {
  const { fixCase = false, language = DEFAULT_LANGUAGE } = options;
  const normalized = normalizeFormula(text);
  try {
    return new MF(fixCase ? ensureCase(normalized) : normalized).toMF();
  } catch (error) {
    throw new FormulaError(parserMessage(text, error, language));
  }
}

/**
 * Atom counts per element over a whole formula, isotopes folded into their
 * element and every part added up.
 * @param parsed - A formula as `readFormula` read it.
 * @returns Symbol → count, in the order the formula first names each element.
 */
export function atomCounts(parsed: ParsedFormula): Map<string, number> {
  const counts = new Map<string, number>();
  for (const part of parsed.parts) {
    for (const atom of part.atoms) {
      counts.set(atom.symbol, (counts.get(atom.symbol) ?? 0) + atom.count);
    }
  }
  return counts;
}

/**
 * A formula as HTML, its subscripts and its charge marked up, so a value
 * copied from the page keeps them when it is pasted into a document.
 * @param text - A formula as typed.
 * @returns The markup, or the text itself when it is not a formula.
 */
export function formulaHtml(text: string): string {
  try {
    return new MF(normalizeFormula(text)).toHtml();
  } catch {
    return text.trim();
  }
}

/**
 * A formula written for prose, with true subscripts and superscripts and its
 * charge the way a chemist writes it: `NO₃⁻`, `Fe³⁺`, `²³⁸U¹⁹F₆`.
 * @param text - A formula as typed.
 * @returns The formula in Unicode, or the text itself when it is not one.
 */
export function formulaText(text: string): string {
  let written: string;
  try {
    written = new MF(normalizeFormula(text)).toText();
  } catch {
    return text.trim();
  }
  return written
    .replaceAll(/\s+•\s+/gu, '·')
    .replace(
      /(?<sign>[⁺⁻])(?<digits>[⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/u,
      (_match, sign: string, digits: string) =>
        `${digits === '¹' ? '' : digits}${sign}`,
    );
}
