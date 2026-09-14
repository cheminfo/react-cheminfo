// tokens-ok: file — the checker compares fallbacks with the family's values.
/**
 * The pieces of CSS the token checker reads beyond a colour: a declaration of
 * one of the site's own palette properties, the token a `var()` reads, and
 * whether the fallback written after it is that token's value.
 */

import { normalizeColor } from './colors.ts';
import type { FamilyToken } from './familyTokens.ts';
import { FAMILY_TOKEN_VALUES, isFamilyToken } from './familyTokens.ts';

// Longest first, so `--brand-alt` is never read as `--brand`.
const BRAND_PROPERTIES = ['--brand-alt', '--brand', '--accent'] as const;

/**
 * A declaration of one of the palette properties a site renders through
 * `<SiteTheme siteId>`. Reading one — `var(--brand)` — has no colon after the
 * name, so it is never returned.
 * @param lower - The text being scanned, already lowercased.
 * @param start - The index of the first dash.
 * @returns The property and the index just past its name, or `null`.
 */
export function readBrandDeclaration(
  lower: string,
  start: number,
): { name: string; end: number } | null {
  for (const name of BRAND_PROPERTIES) {
    if (!lower.startsWith(name, start)) continue;
    const after = start + name.length;
    // `--brand-alt-text` is its own property, not `--brand-alt`.
    if (isNameChar(lower[after])) return null;
    let index = after;
    while (isSpace(lower[index])) index++;
    if (lower[index] !== ':') return null;
    return { name, end: after };
  }
  return null;
}

/**
 * The family token a `var()` reads, when it reads one.
 * @param lower - The text being scanned, already lowercased.
 * @param start - The index just past the `var(`.
 * @returns The token, or `null` for any other property.
 */
export function readVarToken(lower: string, start: number): FamilyToken | null {
  let index = start;
  while (/\s/.test(lower[index] ?? '')) index++;
  const nameStart = index;
  while (isNameChar(lower[index])) index++;
  const name = lower.slice(nameStart, index);
  return isFamilyToken(name) ? name : null;
}

/** A parenthesis the scanner has opened and not yet closed. */
export interface OpenParen {
  /** Whether it opens a `var(`. */
  isVar: boolean;
  /** The family token the `var(` reads, or `null`. */
  token: FamilyToken | null;
  /** Where the fallback starts, just past the first comma, or -1. */
  fallbackStart: number;
  /** The line the first comma is on. */
  fallbackLine: number;
  /** The index the line of the first comma starts at. */
  fallbackLineStart: number;
}

/** A fallback that is not its token's value, and where it is written. */
export interface DriftedFallback {
  /** Which line its first character is on, counting from 1. */
  line: number;
  /** Which column, counting from 1. */
  column: number;
  /** The fallback as written, without its surrounding spaces. */
  text: string;
  /** The value the token holds, and what to write instead. */
  hint: string;
  /** The fallback as a colour, or `null` when it is not one. */
  color: string | null;
}

/**
 * The fallback of a family token that is not that token's value, reported at
 * its first character.
 * @param text - The file, as written.
 * @param open - The `var(` being closed.
 * @param end - The index of its closing parenthesis.
 * @returns Where the fallback is and what it should be, or `null` when it is
 * the token's value or there is none.
 */
export function driftedFallback(
  text: string,
  open: OpenParen,
  end: number,
): DriftedFallback | null {
  if (open.token === null || open.fallbackStart === -1) return null;
  const fallback = text.slice(open.fallbackStart, end);
  const hint = fallbackDrift(open.token, fallback);
  if (hint === null) return null;

  let line = open.fallbackLine;
  let lineStart = open.fallbackLineStart;
  let index = open.fallbackStart;
  while (index < end && /\s/.test(text[index] ?? '')) {
    if (text[index] === '\n') {
      line++;
      lineStart = index + 1;
    }
    index++;
  }
  return {
    line,
    column: index - lineStart + 1,
    text: fallback.trim(),
    hint,
    color: normalizeColor(fallback),
  };
}

// What is wrong with the fallback written for a token, if anything. A colour is
// compared as a colour, so `#fff` stands for `#ffffff`; anything else as text
// with its spacing collapsed.
function fallbackDrift(token: FamilyToken, fallback: string): string | null {
  const expected = FAMILY_TOKEN_VALUES[token];
  const written = fallback.trim();
  // No value of the family's holds a quote: one here means the `var(` was cut
  // off by the end of a string, in a test or a snippet, rather than written.
  if (/["'`]/.test(written)) return null;
  const expectedColor = normalizeColor(expected);
  const writtenColor = normalizeColor(written);
  const matches =
    expectedColor !== null && writtenColor !== null
      ? expectedColor === writtenColor
      : collapse(written) === collapse(expected);
  if (matches) return null;
  return `${token} is ${expected} in chrome.css — write TOKEN from react-cheminfo/core, or var(${token}) with no fallback.`;
}

/**
 * Whether a character can continue a custom property name.
 * @param char - The character, or `undefined` past the end.
 * @returns Whether it belongs to the name.
 */
function isNameChar(char: string | undefined): boolean {
  if (char === undefined) return false;
  return (
    (char >= '0' && char <= '9') ||
    (char >= 'a' && char <= 'z') ||
    char === '-' ||
    char === '_'
  );
}

/**
 * Whether a character is the spacing allowed inside a declaration's line.
 * @param char - The character, or `undefined` past the end.
 * @returns Whether it is a space or a tab.
 */
function isSpace(char: string | undefined): boolean {
  return char === ' ' || char === '\t';
}

function collapse(text: string): string {
  return text.toLowerCase().replaceAll(/\s+/g, ' ');
}
