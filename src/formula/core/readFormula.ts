/**
 * A formula read into its parts, atoms and charges, with every failure
 * explained in a sentence written for a student rather than for a parser.
 */

import { MF } from 'mf-parser';

import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { catalogTranslate } from '../../i18n/core/translate.ts';
import { elementBySymbol } from '../../periodic/core/elements.ts';

import { normalizeFormula } from './normalizeFormula.ts';

/** One kind of atom in one part of a formula. */
export interface FormulaAtom {
  /** Element symbol, e.g. `Fe`. */
  symbol: string;
  /** Mass number when the formula names the isotope, e.g. 56 in `[56Fe]`. */
  massNumber: number | null;
  /** How many of them the part holds. */
  count: number;
}

/** One `.`-separated part of a formula: its atoms and its charge. */
export interface FormulaPart {
  /** The atoms of the part, in the order the formula first names them. */
  atoms: FormulaAtom[];
  /** The charge of the part. */
  charge: number;
}

/** A formula as {@link readFormula} reads it. */
export interface ParsedFormula {
  /** What was handed to the parser, after {@link normalizeFormula}. */
  formula: string;
  /** Its `.`-separated parts. */
  parts: FormulaPart[];
  /** Sum of the charges of every part. */
  charge: number;
}

/** What the formula readers are told beyond the text. */
export interface FormulaOptions {
  /**
   * The language a failure is explained in.
   * @default 'en'
   */
  language?: Language;
}

/** A formula that cannot be read, with a message written for a student. */
export class FormulaError extends Error {
  override name = 'FormulaError';
}

interface ParserEntry {
  kind: string;
  value: unknown;
  multiplier?: number;
}

/**
 * Read a formula into its parts, atoms and charges.
 * @param text - A formula as typed, e.g. `Fe(3+)`, `NO3-` or `[238U][19F]6`.
 * @param options - The language a failure is explained in.
 * @returns The parsed formula.
 * @throws {FormulaError} When the text is empty or is not a formula.
 */
export function readFormula(
  text: string,
  options: FormulaOptions = {},
): ParsedFormula {
  const { language = DEFAULT_LANGUAGE } = options;
  const t = catalogTranslate(CHROME_CATALOG, language);
  const formula = normalizeFormula(text);
  if (formula === '') throw new FormulaError(t('formula.typeFirst'));

  let rawParts: ParserEntry[][];
  try {
    rawParts = new MF(formula).toParts() as ParserEntry[][];
  } catch (error) {
    throw new FormulaError(parserMessage(text, error, language));
  }

  const order = writtenOrder(formula);
  const parts: FormulaPart[] = [];
  let total = 0;
  for (const rawPart of rawParts) {
    const part = readPart(text, rawPart, language);
    part.atoms.sort(
      (a, b) =>
        (order.get(a.symbol) ?? order.size) -
        (order.get(b.symbol) ?? order.size),
    );
    total += part.charge;
    parts.push(part);
  }
  if (parts.every((part) => part.atoms.length === 0)) {
    throw new FormulaError(t('formula.noAtom', { formula: text.trim() }));
  }
  return { formula, parts, charge: total };
}

/**
 * The atomic number of an element.
 * @param symbol - Its symbol.
 * @param options - The language a failure is explained in.
 * @returns Z.
 * @throws {FormulaError} When the symbol is not an element.
 */
export function atomicNumber(
  symbol: string,
  options: FormulaOptions = {},
): number {
  const element = elementBySymbol(symbol);
  if (element === undefined) {
    const t = catalogTranslate(
      CHROME_CATALOG,
      options.language ?? DEFAULT_LANGUAGE,
    );
    throw new FormulaError(t('formula.notElement', { symbol }));
  }
  return element.atomicNumber;
}

/**
 * The name of an element, as the periodic table writes it.
 * @param symbol - Its symbol.
 * @returns The English name, or the symbol itself for an unknown one.
 */
export function elementName(symbol: string): string {
  return elementBySymbol(symbol)?.name ?? symbol;
}

/**
 * Explain a failure of the parser in a student's terms.
 * @param text - The formula as typed.
 * @param error - What the parser threw.
 * @param language - The language of the sentence.
 * @returns The sentence.
 */
export function parserMessage(
  text: string,
  error: unknown,
  language: Language,
): string {
  const t = catalogTranslate(CHROME_CATALOG, language);
  const raw = error instanceof Error ? error.message : String(error);
  const unknown = /element unknown: (?<symbol>\S+)/u.exec(raw);
  if (unknown?.groups?.symbol) {
    return t('formula.notElement', { symbol: unknown.groups.symbol });
  }
  const reason = raw.split('\n', 1)[0] ?? raw;
  return t('formula.unreadable', { formula: text.trim(), reason });
}

/**
 * Where each element first appears in a formula as it is written, so a table
 * lists Sb before O for Sb2O5 rather than in the parser's canonical order.
 * @param formula - The formula as given to the parser.
 * @returns Symbol → position of its first appearance.
 */
function writtenOrder(formula: string): Map<string, number> {
  const order = new Map<string, number>();
  for (const match of formula.matchAll(/[A-Z][a-z]*/gu)) {
    if (!order.has(match[0])) order.set(match[0], order.size);
  }
  return order;
}

function readPart(
  text: string,
  rawPart: ParserEntry[],
  language: Language,
): FormulaPart {
  const t = catalogTranslate(CHROME_CATALOG, language);
  const atoms: FormulaAtom[] = [];
  let charge = 0;
  for (const entry of rawPart) {
    if (entry.kind === 'charge') {
      charge += Number(entry.value);
      continue;
    }
    const count = entry.multiplier ?? 1;
    if (!Number.isInteger(count) || count <= 0) {
      throw new FormulaError(
        t('formula.wholeCounts', { formula: text.trim(), count }),
      );
    }
    if (entry.kind === 'atom' && typeof entry.value === 'string') {
      atomicNumber(entry.value, { language });
      atoms.push({ symbol: entry.value, massNumber: null, count });
      continue;
    }
    if (entry.kind === 'isotope') {
      const { atom, isotope } = entry.value as {
        atom: string;
        isotope: number;
      };
      atomicNumber(atom, { language });
      atoms.push({ symbol: atom, massNumber: isotope, count });
      continue;
    }
    throw new FormulaError(
      t('formula.unknownNotation', { formula: text.trim() }),
    );
  }
  return { atoms, charge };
}
