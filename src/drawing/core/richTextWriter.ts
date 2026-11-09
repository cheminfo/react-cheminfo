/**
 * Runs of a caption written back as the marks they are read from, so a
 * caption typed in the editor is stored as one written by hand.
 */

import { roundCoordinate } from './geometry.ts';
import type { Script, Span } from './richText.ts';

/** What has to be escaped to be written as it is. */
const MARK_CHARACTERS = /[\\*_^{}]/g;

/**
 * Write lines of runs as the marks they are read back from.
 * @param lines - One list of runs per line.
 * @returns The caption, with its marks.
 */
export function writeRichText(lines: ReadonlyArray<readonly Span[]>): string {
  return lines.map((line) => writeLine(line)).join('\n');
}

function writeLine(spans: readonly Span[]): string {
  let written = '';
  let bold = false;
  let italic = false;
  let size: number | undefined;
  for (const span of spans) {
    if (span.text === '') continue;
    if (span.size !== size) {
      if (size !== undefined) written += '}';
      size = span.size;
      if (size !== undefined) written += `{${number(size)}pt:`;
    }
    if (Boolean(span.bold) !== bold) {
      written += '**';
      bold = !bold;
    }
    if (Boolean(span.italic) !== italic) {
      written += '*';
      italic = !italic;
    }
    if (span.script) written += writeScript(span.text, span.script);
    else written += escape(span.text);
  }
  if (italic) written += '*';
  if (bold) written += '**';
  if (size !== undefined) written += '}';
  return written;
}

function writeScript(text: string, script: Script): string {
  const mark = script === 'sub' ? '_' : '^';
  if (text.length === 1 && !/[\s\\{}]/.test(text)) return `${mark}${text}`;
  return `${mark}{${text.replaceAll(/[\\}]/g, String.raw`\$&`)}}`;
}

function escape(text: string): string {
  return text.replaceAll(MARK_CHARACTERS, String.raw`\$&`);
}

// A coordinate as the SVG writes it.
function number(value: number): string {
  return String(roundCoordinate(value));
}
