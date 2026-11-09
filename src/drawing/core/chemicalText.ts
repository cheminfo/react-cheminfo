/**
 * The chemical rules of a caption: the digits of a formula lowered and its
 * charge raised as a textbook sets them, from text written without marks.
 *
 * A charge is read from the way chemists type it — `Na+`, `Ca2+`, `NO3-`,
 * `SO42-`, `SO4--`, `[Cu(NH3)4]2+` — or from mf-parser's `SO4(2-)`, and
 * written as IUPAC does: the number first, then the sign, `²⁻`. The digits
 * before a single sign are ambiguous, and are read as the common ions are:
 * all of them are the charge after one element or a bracket (`Ca2+`, `Fe3+`,
 * `]2+`), only the last one after several atoms (`SO42-`, `PO43-`), and none
 * of them for one digit after several atoms (`NO3-`, `NH4+`). `O2(-)` is the
 * way to write what the rules would read otherwise.
 */

import type { Script } from './richText.ts';

/** A stretch of a line the chemical rules set as a script. */
export interface ChemicalRange {
  /** The first character, as an index in the line. */
  start: number;
  /** The index after the last character. */
  end: number;
  /** Lowered or raised. */
  script: Script;
  /** What is written in its place: the digits, or the charge as IUPAC writes it. */
  text: string;
}

/** What ends a word, so a charge before it is raised. */
const WORD_END = /[\s,;:)\]/.·]/;

/** What a formula is made of, back to where its word starts. */
const FORMULA_CHARACTER = /[A-Za-z0-9()[\]]/;

/** A charge written in parentheses, as mf-parser reads one. */
const PARENTHESIZED_CHARGE = /^\((?<before>\d*)(?<sign>[+\-−])(?<after>\d*)\)/;

/**
 * The stretches of a line the chemical rules lower or raise.
 * @param line - The line, without marks.
 * @param fixed - The characters already set by a mark, which the rules leave
 * alone.
 * @returns The stretches, in order and without overlap.
 */
export function chemicalRanges(
  line: string,
  fixed: readonly boolean[] = [],
): ChemicalRange[] {
  const ranges: ChemicalRange[] = [];
  let index = 0;
  while (index < line.length) {
    const found = fixed[index]
      ? undefined
      : (digitsAt(line, index, fixed) ?? chargeAt(line, index, fixed));
    if (found) {
      ranges.push(...found.ranges);
      index = found.next;
    } else {
      index += 1;
    }
  }
  return ranges;
}

/** What a rule makes of the text at a position, and where the next starts. */
interface Found {
  ranges: ChemicalRange[];
  next: number;
}

// The digits after a symbol: a count, a charge, or the number of an R.
function digitsAt(
  line: string,
  start: number,
  fixed: readonly boolean[],
): Found | undefined {
  if (!isDigit(line[start]) || !/[A-Za-z)\]]/.test(line[start - 1] ?? ' ')) {
    return undefined;
  }
  let end = start;
  while (isDigit(line[end]) && !fixed[end]) end++;
  const digits = line.slice(start, end);
  const charge = formulaLike(line, start)
    ? (signsAt(line, end, fixed) ?? parenthesizedAt(line, end, fixed))
    : undefined;
  if (!charge) {
    const raised =
      line[start - 1] === 'R' && !/[A-Za-z]/.test(line[start - 2] ?? ' ');
    return {
      ranges: [{ start, end, script: raised ? 'sup' : 'sub', text: digits }],
      next: end,
    };
  }
  const { count, magnitude } =
    charge.magnitude === undefined
      ? splitDigits(line, start, digits)
      : { count: digits, magnitude: charge.magnitude };
  const ranges: ChemicalRange[] = [];
  if (count !== '') {
    ranges.push({
      start,
      end: start + count.length,
      script: 'sub',
      text: count,
    });
  }
  ranges.push({
    start: start + count.length,
    end: charge.next,
    script: 'sup',
    text: chargeText(magnitude, charge.sign),
  });
  return { ranges, next: charge.next };
}

// A charge right after a symbol or a bracket, with no digits before it.
function chargeAt(
  line: string,
  start: number,
  fixed: readonly boolean[],
): Found | undefined {
  if (!/[A-Za-z)\]]/.test(line[start - 1] ?? ' ')) return undefined;
  if (!formulaLike(line, start)) return undefined;
  const charge =
    signsAt(line, start, fixed) ?? parenthesizedAt(line, start, fixed);
  if (!charge) return undefined;
  return {
    ranges: [
      {
        start,
        end: charge.next,
        script: 'sup',
        text: chargeText(charge.magnitude ?? '', charge.sign),
      },
    ],
    next: charge.next,
  };
}

/** A charge read at a position, before it is set. */
interface Charge {
  /** Its size, or undefined when the digits before it say. */
  magnitude?: string;
  /** Its sign. */
  sign: string;
  /** Where the text after it starts. */
  next: number;
}

// `+`, `-` or a run of the same sign ending a word: `++` is a charge of 2.
function signsAt(
  line: string,
  start: number,
  fixed: readonly boolean[],
): Charge | undefined {
  const sign = signOf(line[start]);
  if (!sign || fixed[start]) return undefined;
  let end = start + 1;
  while (signOf(line[end]) === sign && !fixed[end]) end++;
  if (!isWordEnd(line, end)) return undefined;
  const run = end - start;
  return { magnitude: run === 1 ? undefined : String(run), sign, next: end };
}

// A charge in parentheses ending a word: `(2-)`, `(+3)`, `(-)`.
function parenthesizedAt(
  line: string,
  start: number,
  fixed: readonly boolean[],
): Charge | undefined {
  const match = PARENTHESIZED_CHARGE.exec(line.slice(start));
  if (!match) return undefined;
  const [whole] = match;
  const { before = '', sign = '+', after = '' } = match.groups ?? {};
  const next = start + whole.length;
  if ((before !== '' && after !== '') || !isWordEnd(line, next)) {
    return undefined;
  }
  for (let index = start; index < next; index++) {
    if (fixed[index]) return undefined;
  }
  return { magnitude: before || after, sign: signOf(sign) ?? '+', next };
}

// Which of the digits before a single sign count atoms, and which the charge.
function splitDigits(
  line: string,
  start: number,
  digits: string,
): { count: string; magnitude: string } {
  if (line[start - 1] === ']') return { count: '', magnitude: digits };
  if (digits.length > 1) {
    return digits.endsWith('0')
      ? { count: digits, magnitude: '' }
      : { count: digits.slice(0, -1), magnitude: digits.slice(-1) };
  }
  return isOneElement(line, start)
    ? { count: '', magnitude: digits }
    : { count: digits, magnitude: '' };
}

// Whether the letters before a position are one element standing alone.
function isOneElement(line: string, end: number): boolean {
  let start = end;
  while (start > 0 && /[A-Za-z]/.test(line[start - 1] as string)) start--;
  if (!/^[A-Z][a-z]?$/.test(line.slice(start, end))) return false;
  return !/[A-Za-z0-9)\]]/.test(line[start - 1] ?? ' ');
}

// Whether the word a position ends reads as a formula: it starts with a
// capital, after any opening bracket, or it is the electron.
function formulaLike(line: string, end: number): boolean {
  let start = end;
  while (start > 0 && FORMULA_CHARACTER.test(line[start - 1] as string)) {
    start--;
  }
  const word = line.slice(start, end).replace(/^[([]+/, '');
  return word === 'e' || /^[A-Z]/.test(word);
}

function chargeText(magnitude: string, sign: string): string {
  return magnitude === '' || magnitude === '1' ? sign : `${magnitude}${sign}`;
}

function signOf(character: string | undefined): string | undefined {
  if (character === '+') return '+';
  if (character === '-' || character === '−') return '−';
  return undefined;
}

function isDigit(character: string | undefined): boolean {
  return character !== undefined && character >= '0' && character <= '9';
}

function isWordEnd(line: string, index: number): boolean {
  return index >= line.length || WORD_END.test(line[index] as string);
}
