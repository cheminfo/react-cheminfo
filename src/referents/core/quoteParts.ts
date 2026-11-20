/**
 * The text of a quote a figure carries, read out of its inline HTML as runs of
 * text and the marks over them: what a document inserts, and what a menu
 * shows. Only the marks a quote may carry are read; every other tag is
 * dropped, its text kept, so nothing a figure carries is ever run as markup.
 */

import { unescapeXml } from '../../drawing/render/markup.ts';

/** A mark over a run of a quote's text. */
export type QuoteMark = 'superscript' | 'subscript' | 'italic' | 'bold';

/** A run of a quote's text, under the same marks. */
export interface QuotePart {
  text: string;
  /** The marks over it, each once, in the order they were opened. */
  marks: QuoteMark[];
}

const MARKS: Readonly<Record<string, QuoteMark>> = {
  sup: 'superscript',
  sub: 'subscript',
  i: 'italic',
  em: 'italic',
  b: 'bold',
  strong: 'bold',
};

const TAG = /^<(?<close>\/)?(?<name>[a-z][a-z\d]*)\b[^>]*>$/i;

/**
 * The runs of a quote's text.
 * @param html - The quote, as inline HTML.
 * @returns Its text, run by run; adjacent runs under the same marks are one.
 */
export function quoteParts(html: string): QuotePart[] {
  const parts: QuotePart[] = [];
  const open: QuoteMark[] = [];
  for (const token of html.split(/(?<tag><[^>]*>)/)) {
    if (token === '') continue;
    if (token.startsWith('<')) {
      const groups = TAG.exec(token)?.groups;
      const mark = MARKS[groups?.name?.toLowerCase() ?? ''];
      if (mark === undefined) continue;
      if (groups?.close === undefined) {
        open.push(mark);
      } else {
        const index = open.lastIndexOf(mark);
        if (index !== -1) open.splice(index, 1);
      }
      continue;
    }
    append(parts, decoded(token), [...new Set(open)]);
  }
  return parts;
}

function append(parts: QuotePart[], text: string, marks: QuoteMark[]): void {
  if (text === '') return;
  const last = parts.at(-1);
  if (last !== undefined && sameMarks(last.marks, marks)) {
    last.text += text;
  } else {
    parts.push({ text, marks });
  }
}

function sameMarks(first: QuoteMark[], second: QuoteMark[]): boolean {
  return (
    first.length === second.length &&
    first.every((mark) => second.includes(mark))
  );
}

function decoded(text: string): string {
  try {
    return unescapeXml(text);
  } catch {
    // A character reference past the last code point: kept as written.
    return text;
  }
}
