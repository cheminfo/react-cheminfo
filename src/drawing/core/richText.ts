/**
 * The marks a caption is written with, read into runs of one style.
 *
 * `*italic*`, `**bold**`, `_2` or `_{12}` for a subscript, `^+` or `^{2+}` for
 * a superscript, `{14pt:…}` for a run in another size, and `\` before any mark
 * to write it as it is. With chemical formatting the digits and the charges of
 * a formula are set without marks (`CH2Cl2`, `Ca2+`, `SO4--`), and the number
 * after an R is raised as a substituent's is (`R1`); without it the text stays
 * on its line. `{{Ca(2+)}}` is read as the scripts mf-parser sets.
 */

import { chemicalRanges } from './chemicalText.ts';
import type { Glyph } from './richTextMarks.ts';
import { readMarks } from './richTextMarks.ts';

export { MAX_RUN_SIZE } from './richTextMarks.ts';

/** How a run sits on the line. */
export type Script = 'sub' | 'sup';

/** A run of a caption written in one style. */
export interface Span {
  /** The characters. */
  text: string;
  /**
   * Lowered or raised, in the smaller size of a script.
   * @default undefined — on the baseline
   */
  script?: Script;
  /**
   * Bold.
   * @default false
   */
  bold?: boolean;
  /**
   * Italic.
   * @default false
   */
  italic?: boolean;
  /**
   * The font size of the run, in points; a script is set smaller than it.
   * @default undefined — the size of the caption
   */
  size?: number;
}

/**
 * Read a caption into the lines of runs it is drawn in.
 * @param text - The caption, with its marks.
 * @param chemical - Whether formula digits and charges are set without marks.
 * @returns One list of runs per line.
 */
export function parseRichText(text: string, chemical: boolean): Span[][] {
  return text.split('\n').map((line) => {
    const glyphs = readMarks(line);
    return mergeGlyphs(chemical ? applyChemistry(glyphs) : glyphs);
  });
}

/**
 * Read a caption into the lines of runs it is written in, before the chemical
 * rules: what the caption editor opens.
 * @param text - The caption, with its marks.
 * @returns One list of runs per line.
 */
export function readRichText(text: string): Span[][] {
  return text.split('\n').map((line) => mergeGlyphs(readMarks(line)));
}

/**
 * The glyphs with the chemical rules applied to those no mark has set, read
 * over the whole line: the digits and charges of a formula become scripts.
 * @param glyphs - The glyphs of one line.
 * @returns The glyphs, each stretch the rules set replaced by one glyph.
 */
export function applyChemistry(glyphs: Glyph[]): Glyph[] {
  let line = '';
  // Per character of the line: whether a mark set it, and its glyph.
  const fixed: boolean[] = [];
  const owners: number[] = [];
  for (const [index, glyph] of glyphs.entries()) {
    line += glyph.text;
    let units = glyph.text.length;
    while (units-- > 0) {
      fixed.push(glyph.fixed);
      owners.push(index);
    }
  }
  const ranges = chemicalRanges(line, fixed);
  if (ranges.length === 0) return glyphs;
  const result: Glyph[] = [];
  let index = 0;
  for (const range of ranges) {
    const start = owners[range.start] as number;
    for (; index < start; index++) result.push(glyphs[index] as Glyph);
    const first = glyphs[start] as Glyph;
    result.push({ ...first, text: range.text, script: range.script });
    index = (owners[range.end - 1] as number) + 1;
  }
  for (; index < glyphs.length; index++) result.push(glyphs[index] as Glyph);
  return result;
}

/**
 * The runs glyphs are drawn in: neighbours of one style joined.
 * @param glyphs - The glyphs of one line.
 * @returns Its runs.
 */
export function mergeGlyphs(glyphs: readonly Glyph[]): Span[] {
  const spans: Span[] = [];
  for (const glyph of glyphs) {
    const last = spans.at(-1);
    if (
      last &&
      last.script === glyph.script &&
      Boolean(last.bold) === glyph.bold &&
      Boolean(last.italic) === glyph.italic &&
      last.size === glyph.size
    ) {
      last.text += glyph.text;
      continue;
    }
    const span: Span = { text: glyph.text };
    if (glyph.script) span.script = glyph.script;
    if (glyph.bold) span.bold = true;
    if (glyph.italic) span.italic = true;
    if (glyph.size !== undefined) span.size = glyph.size;
    spans.push(span);
  }
  return spans;
}
