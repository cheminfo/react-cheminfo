/**
 * The metrics of Helvetica, which Arial shares glyph for glyph: the advance of
 * each character in thousandths of an em, from Adobe's core font metrics.
 *
 * Labels are laid out from these numbers rather than measured in a browser, so
 * a drawing is the same file wherever it is made — in a test, in Chrome or in
 * Safari — and the bonds stop at the same distance from every label.
 */

/** Advance widths of the printable ASCII characters, from space (32). */
const ASCII_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278,
  278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584,
  584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556,
  833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278,
  278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222,
  500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500,
  500, 334, 260, 334, 584,
];

/** Advance widths of Helvetica Bold, for the bold runs of a caption. */
const BOLD_WIDTHS = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278,
  278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584,
  584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611,
  833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333,
  278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278,
  556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556,
  500, 389, 280, 389, 584,
];

/** Advance widths of Times Roman, for a caption set in Times. */
const TIMES_WIDTHS = [
  250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250,
  278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 278, 278, 564, 564,
  564, 444, 921, 722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611,
  889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333,
  278, 333, 469, 500, 333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278,
  500, 278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500,
  444, 480, 200, 480, 541,
];

/** Advance widths of Times Bold. */
const TIMES_BOLD_WIDTHS = [
  250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250,
  278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570,
  570, 500, 930, 722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667,
  944, 722, 778, 611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667, 333,
  278, 333, 581, 500, 333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333,
  556, 278, 833, 556, 500, 556, 556, 444, 389, 333, 556, 500, 722, 500, 500,
  444, 394, 220, 394, 520,
];

/** The advance of every character of Courier: it is monospaced. */
const COURIER_ADVANCE = 600;

/** Advance widths of the characters beyond ASCII that labels use. */
const OTHER_WIDTHS: Readonly<Record<string, number>> = {
  '−': 584, // minus sign
  '•': 350, // bullet: a radical
  '‡': 556, // double dagger: a transition state
  '†': 556,
  '–': 556,
  '·': 278,
  '°': 400,
  '×': 584,
};

/** The height of a capital letter, in thousandths of an em. */
export const CAP_HEIGHT = 718;

/**
 * The height of a capital letter.
 * @param size - The font size, in points.
 * @returns The height, in points.
 */
export function capHeight(size: number): number {
  return (CAP_HEIGHT * size) / 1000;
}

/** The height of a lowercase letter without ascender. */
export const X_HEIGHT = 523;

/** Characters whose outline is round, so a bond stops along a curve. */
const ROUND_GLYPHS = new Set('CGOQSceos0368');

/**
 * The advance of one character.
 * @param character - A single character.
 * @returns Its advance, in thousandths of an em.
 */
export function advanceOf(character: string): number {
  const code = character.codePointAt(0) ?? 0;
  if (code >= 32 && code < 32 + ASCII_WIDTHS.length) {
    return ASCII_WIDTHS[code - 32] ?? 556;
  }
  return OTHER_WIDTHS[character] ?? 556;
}

/** The metrics a font is laid out with: Arial shares Helvetica's. */
export type FontMetrics = 'helvetica' | 'times' | 'courier';

/**
 * The metrics of a CSS font family, from its first name.
 * @param family - The font family, as written into the drawing.
 * @returns Times for Times New Roman, Courier for Courier New, Helvetica
 * otherwise.
 */
export function metricsOf(family: string): FontMetrics {
  const first = (family.split(',', 1)[0] ?? '').replaceAll(/['"]/g, '').trim();
  if (first.startsWith('Times')) return 'times';
  if (first.startsWith('Courier')) return 'courier';
  return 'helvetica';
}

/**
 * The width a text takes when written.
 * @param text - The text.
 * @param size - The font size, in points.
 * @param bold - Whether it is set in bold.
 * @param metrics - The font it is set in.
 * @returns Its width, in points.
 */
export function textWidth(
  text: string,
  size: number,
  bold = false,
  metrics: FontMetrics = 'helvetica',
): number {
  let total = 0;
  for (const character of text) {
    total += advanceIn(character, bold, metrics);
  }
  return (total * size) / 1000;
}

/**
 * Whether a character's outline is round rather than square.
 * @param character - A single character.
 * @returns True for O, C, S and their kin.
 */
export function isRoundGlyph(character: string): boolean {
  return ROUND_GLYPHS.has(character);
}

function advanceIn(
  character: string,
  bold: boolean,
  metrics: FontMetrics,
): number {
  if (metrics === 'courier') return COURIER_ADVANCE;
  const code = character.codePointAt(0) ?? 0;
  const ascii = code >= 32 && code < 127;
  if (metrics === 'times') {
    const widths = bold ? TIMES_BOLD_WIDTHS : TIMES_WIDTHS;
    if (ascii) return widths[code - 32] ?? 500;
    // Times is about a tenth narrower than Helvetica beyond ASCII.
    return Math.round(advanceOf(character) * 0.9);
  }
  if (bold && ascii) return BOLD_WIDTHS[code - 32] ?? 556;
  return advanceOf(character);
}
