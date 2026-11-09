/**
 * The marks of one line of a caption, read character by character into the
 * style each one is written in.
 */

import { formulaParts } from './formulaText.ts';
import type { Script } from './richText.ts';

/** The mark that opens a run in another size. */
const SIZE_GROUP = /^\{(?<points>\d+(?:\.\d+)?)pt:/;

/** The largest size a run may ask for, in points. */
export const MAX_RUN_SIZE = 288;

/** One character of a line, or a script, in its style. */
export interface Glyph {
  text: string;
  bold: boolean;
  italic: boolean;
  size?: number;
  script?: Script;
  /** Set by a mark or escaped, so the chemical rules leave it alone. */
  fixed: boolean;
}

/**
 * Read the marks of a line.
 * @param line - One line of a caption, with its marks.
 * @returns Its characters and scripts, each in its style.
 */
export function readMarks(line: string): Glyph[] {
  const glyphs: Glyph[] = [];
  let bold = false;
  let italic = false;
  let size: number | undefined;
  const push = (text: string, fixed: boolean, script?: Script) => {
    const glyph: Glyph = { text, bold, italic, fixed };
    if (size !== undefined) glyph.size = size;
    if (script) glyph.script = script;
    glyphs.push(glyph);
  };
  let index = 0;
  while (index < line.length) {
    const character = line[index] as string;
    const group =
      size === undefined ? SIZE_GROUP.exec(line.slice(index)) : null;
    const formula = line.startsWith('{{', index)
      ? readGroup(line, index + 2, '}}')
      : undefined;
    if (character === '\\' && index + 1 < line.length) {
      push(line[index + 1] as string, true);
      index += 2;
    } else if (formula?.value) {
      // Fixed in the scripts mf-parser reads, which the editor opens as such.
      const parts = formulaParts(formula.value) ?? [{ text: formula.value }];
      for (const part of parts) push(part.text, true, part.script);
      index = formula.next;
    } else if (group && isRunSize(Number(group.groups?.points))) {
      size = Number(group.groups?.points);
      index += group[0].length;
    } else if (character === '}' && size !== undefined) {
      size = undefined;
      index += 1;
    } else if (line.startsWith('**', index)) {
      bold = !bold;
      index += 2;
    } else if (character === '*') {
      italic = !italic;
      index += 1;
    } else if (
      (character === '_' || character === '^') &&
      index + 1 < line.length
    ) {
      const braced =
        line[index + 1] === '{' ? readGroup(line, index + 2, '}') : undefined;
      const { value, next } = braced ?? {
        value: line[index + 1] as string,
        next: index + 2,
      };
      const script = character === '_' ? 'sub' : 'sup';
      push(value.replaceAll('-', '−'), true, script);
      index = next;
    } else {
      push(character, false);
      index += 1;
    }
  }
  return glyphs;
}

// The text of a group up to its closing mark, escapes read, or undefined
// when it is never closed.
function readGroup(
  line: string,
  start: number,
  close: string,
): { value: string; next: number } | undefined {
  let value = '';
  for (let index = start; index < line.length; index++) {
    const character = line[index] as string;
    if (character === '\\' && index + 1 < line.length) {
      value += line[index + 1] as string;
      index++;
    } else if (line.startsWith(close, index)) {
      return { value, next: index + close.length };
    } else {
      value += character;
    }
  }
  return undefined;
}

function isRunSize(size: number): boolean {
  return size > 0 && size <= MAX_RUN_SIZE;
}
