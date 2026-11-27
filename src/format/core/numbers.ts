import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';

import { clamp } from './clamp.ts';
import { MISSING_VALUE } from './missing.ts';

const MAXIMUM_DIGITS = 20;
const MAXIMUM_SIGNIFICANT = 21;
const DEFAULT_DIGITS = 2;
const DEFAULT_PERCENT_DIGITS = 1;
const PERCENT = 100;

/**
 * The locale each language writes its numbers in. English keeps `en-US`, the
 * one every page wrote before pages had a language, so an English page reads
 * as it always did.
 */
const NUMBER_LOCALES: Readonly<Record<Language, string>> = {
  en: 'en-US',
  fr: 'fr',
  de: 'de',
  es: 'es',
  it: 'it',
};

const integerFormatters = new Map<Language, Intl.NumberFormat>();
const compactFormatters = new Map<Language, Intl.NumberFormat>();
const decimalFormatters = new Map<string, Intl.NumberFormat>();
const decimalSeparators = new Map<Language, string>();

/** A precision counted in significant digits rather than in decimals. */
export interface SignificantDigits {
  /** How many significant digits to keep, from 1 to 21. */
  significant: number;
}

/**
 * A whole number, grouped in thousands the way the page's language groups
 * them: `1,234,567` in English, `1 234 567` in French, `1.234.567` in German.
 *
 * Anything after the decimal point is rounded away. The groups follow the
 * language rather than the reader's browser, so a page reads the same way
 * wherever it is opened.
 * @param value - The number to write.
 * @param language - The language of the page. Defaults to English.
 * @returns The grouped number, or the missing marker when it is not finite.
 */
export function formatInteger(
  value: number,
  language: Language = DEFAULT_LANGUAGE,
): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  let formatter = integerFormatters.get(language);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(NUMBER_LOCALES[language], {
      maximumFractionDigits: 0,
    });
    integerFormatters.set(language, formatter);
  }
  return formatter.format(value);
}

/**
 * A number grouped in thousands and held to a fixed number of decimals:
 * `1,234.50` in English, `1 234,50` in French.
 *
 * The digits are kept even when they are zeros, which is what a column of
 * figures wants; use {@link formatTrimmed} for a label that should not carry
 * them.
 * @param value - The number to write.
 * @param digits - Decimals to show. Defaults to `2`; a count outside 0..20 is clamped into it, and one that is not a finite number falls back to the default.
 * @param language - The language of the page, which writes the decimal separator and the groups. Defaults to English.
 * @returns The formatted number, or the missing marker when it is not finite.
 */
export function formatDecimal(
  value: number,
  digits = DEFAULT_DIGITS,
  language: Language = DEFAULT_LANGUAGE,
): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  const safeDigits = wholeCount(digits, 0, MAXIMUM_DIGITS);
  const key = `${language}:${safeDigits}`;
  let formatter = decimalFormatters.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(NUMBER_LOCALES[language], {
      minimumFractionDigits: safeDigits,
      maximumFractionDigits: safeDigits,
    });
    decimalFormatters.set(key, formatter);
  }
  return formatter.format(value);
}

/**
 * A number rounded with the trailing zeros dropped: `1.5`, `2`, `0.125`, or
 * `1,5` in a language written with a decimal comma.
 *
 * The precision is a count of decimals, or of significant digits when passed
 * as `{ significant }` — which is what a concentration spanning decades wants:
 * `formatTrimmed(0.000_123_45, { significant: 3 })` is `0.000123`. The thousands
 * are not grouped, so the result stays a number a reader can type back in; a
 * number too small or too large for plain digits keeps the exponent JavaScript
 * writes it with, e.g. `1.23e-7`.
 * @param value - The number to write.
 * @param digits - Decimals to round to, or `{ significant }`. Defaults to `2` decimals; a count out of range is clamped into it, and one that is not a finite number falls back to 2.
 * @param language - The language of the page, which writes the decimal separator. Defaults to English.
 * @returns The rounded number, or the missing marker when it is not finite.
 */
export function formatTrimmed(
  value: number,
  digits: number | SignificantDigits = DEFAULT_DIGITS,
  language: Language = DEFAULT_LANGUAGE,
): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  const rounded =
    typeof digits === 'number'
      ? value.toFixed(wholeCount(digits, 0, MAXIMUM_DIGITS))
      : value.toPrecision(
          wholeCount(digits.significant, 1, MAXIMUM_SIGNIFICANT),
        );
  return withDecimalSeparator(Number.parseFloat(rounded).toString(), language);
}

/**
 * A share written as a percentage with its unit: `74.2 %`, `74,2 %`.
 *
 * The number is held to a fixed count of decimals, so a column of shares lines
 * up and a title and the sentence under it agree on their precision.
 * @param share - The share, from 0 to 1 — a fraction, never a percentage.
 * @param digits - Decimals in the percentage. Defaults to `1`; a count that is not a finite number falls back to it.
 * @param language - The language of the page. Defaults to English.
 * @returns The percentage and its unit, or the missing marker when the share is not finite.
 */
export function formatPercent(
  share: number,
  digits = DEFAULT_PERCENT_DIGITS,
  language: Language = DEFAULT_LANGUAGE,
): string {
  if (!Number.isFinite(share)) return MISSING_VALUE;
  const safeDigits = Number.isFinite(digits) ? digits : DEFAULT_PERCENT_DIGITS;
  return `${formatDecimal(share * PERCENT, safeDigits, language)} %`;
}

/**
 * A number shortened for a cramped axis or a badge: `999`, `1.2K`, `3.4M`.
 * @param value - The number to write.
 * @param language - The language of the page. Defaults to English.
 * @returns The shortened number, or the missing marker when it is not finite.
 */
export function formatCompact(
  value: number,
  language: Language = DEFAULT_LANGUAGE,
): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  let formatter = compactFormatters.get(language);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(NUMBER_LOCALES[language], {
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    compactFormatters.set(language, formatter);
  }
  return formatter.format(value);
}

/**
 * Write a number JavaScript wrote, `1.5` or `1.23e-7`, with the decimal
 * separator of a language: `1,5` and `1,23e-7` in French.
 * @param text - The number as `String(number)` writes it.
 * @param language - The language of the page.
 * @returns The same number, its decimal point replaced when the language
 * writes another separator.
 */
export function withDecimalSeparator(text: string, language: Language): string {
  const separator = decimalSeparator(language);
  return separator === '.' ? text : text.replace('.', separator);
}

function decimalSeparator(language: Language): string {
  let separator = decimalSeparators.get(language);
  if (separator === undefined) {
    separator = '.';
    const parts = new Intl.NumberFormat(NUMBER_LOCALES[language]).formatToParts(
      1.5,
    );
    for (const part of parts) {
      if (part.type === 'decimal') separator = part.value;
    }
    decimalSeparators.set(language, separator);
  }
  return separator;
}

function wholeCount(count: number, minimum: number, maximum: number): number {
  return Math.trunc(clamp(count, minimum, maximum, DEFAULT_DIGITS));
}
