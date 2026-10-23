/**
 * Reading what a student typed into an answer box, and the verdicts a grader
 * gives a box it cannot grade.
 */

import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { catalogTranslate } from '../../i18n/core/translate.ts';
import { readNumber } from '../../number/core/numberText.ts';

import type { FieldCase } from './series.ts';

/**
 * Read a number the way a student types it: `42`, `+5`, `−3` with a real minus
 * sign, `1,5` with a decimal comma, `75.8 %`, `1 000`.
 *
 * What a typed answer carries beyond a number box — a typographic minus, a
 * percent sign, a space between thousands — is taken off first; the number
 * itself is read by `readNumber`, as every box of the family reads one.
 * @param text - What was typed.
 * @param integer - Whether only a whole number is an answer.
 * @default integer false
 * @returns The number, or undefined when the text is not one.
 */
export function readAnswerNumber(
  text: string,
  integer = false,
): number | undefined {
  const cleaned = text
    .trim()
    .replaceAll(/[−–]/gu, '-')
    .replace(/\s*%$/u, '')
    .replaceAll(/\s/gu, '');
  return readNumber(cleaned, integer);
}

/**
 * Write a signed whole number the way an oxidation state or a charge is
 * written: `+5`, `−2`, `0`.
 * @param value - The number.
 * @returns The number with its sign, and a true minus sign.
 */
export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${-value}`;
  return '0';
}

/**
 * The verdict on a field left empty.
 * @param label - The field, as its box labels it.
 * @param what - What the box asks for, e.g. `a number of electrons`.
 * @param language - The language the reason is written in.
 * @default language 'en'
 * @returns A failed case that says what to type.
 */
export function emptyCase(
  label: string,
  what: string,
  language: Language = DEFAULT_LANGUAGE,
): FieldCase {
  const t = catalogTranslate(CHROME_CATALOG, language);
  return {
    label,
    passed: false,
    reason: t('pedagogy.answerEmpty', { what }),
    actual: null,
  };
}

/**
 * The verdict on a field that does not read as the kind of value it asks for.
 * @param label - The field, as its box labels it.
 * @param typed - What was typed.
 * @param what - What the box asks for, e.g. `a whole number`.
 * @param language - The language the reason is written in.
 * @default language 'en'
 * @returns A failed case quoting what was typed.
 */
export function unreadableCase(
  label: string,
  typed: string,
  what: string,
  language: Language = DEFAULT_LANGUAGE,
): FieldCase {
  const t = catalogTranslate(CHROME_CATALOG, language);
  return {
    label,
    passed: false,
    reason: t('pedagogy.answerUnreadable', { typed: typed.trim(), what }),
    actual: typed,
  };
}
