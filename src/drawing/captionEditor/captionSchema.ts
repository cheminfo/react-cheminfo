/**
 * What a caption is while it is typed: lines of text in bold, italic, a
 * subscript, a superscript or a size of its own, read from and
 * written back as the caption's marks, so nothing but SVG text ever reaches
 * the file.
 */

import type { Mark, Node } from 'prosemirror-model';
import { Schema } from 'prosemirror-model';

import type { Span } from '../core/richText.ts';
import { readRichText } from '../core/richText.ts';
import { writeRichText } from '../core/richTextWriter.ts';

/** The lines of a caption and the styles a run of them can take. */
export const captionSchema = new Schema({
  nodes: {
    doc: { content: 'line+' },
    line: {
      content: 'text*',
      toDOM: () => ['div', { class: 'caption-line' }, 0],
      parseDOM: [{ tag: 'div' }, { tag: 'p' }],
    },
    text: {},
  },
  // The order is the nesting: a size wraps the script it holds, so the
  // script is set smaller than its own run.
  marks: {
    size: {
      attrs: { points: { validate: 'number' } },
      toDOM: (mark) => [
        'span',
        {
          class: 'caption-size',
          'data-points': String(mark.attrs.points),
          style: `--run-size: ${mark.attrs.points}`,
        },
        0,
      ],
      parseDOM: [
        {
          tag: 'span[data-points]',
          getAttrs: (dom) => {
            const points = Number(dom.dataset.points);
            return points > 0 ? { points } : false;
          },
        },
      ],
    },
    bold: {
      toDOM: () => ['strong', 0],
      parseDOM: [{ tag: 'strong' }, { tag: 'b' }],
    },
    italic: {
      toDOM: () => ['em', 0],
      parseDOM: [{ tag: 'em' }, { tag: 'i' }],
    },
    sub: {
      excludes: 'sub sup',
      toDOM: () => ['sub', 0],
      parseDOM: [{ tag: 'sub' }],
    },
    sup: {
      excludes: 'sub sup',
      toDOM: () => ['sup', 0],
      parseDOM: [{ tag: 'sup' }],
    },
  },
});

/**
 * The document a caption is typed in, read from its marks.
 * @param text - The caption, with its marks.
 * @returns The document, one line node per line.
 */
export function captionDocument(text: string): Node {
  const lines = readRichText(text).map((spans) =>
    captionSchema.nodes.line.create(
      null,
      spans.map((span) => captionSchema.text(span.text, marksOf(span))),
    ),
  );
  return captionSchema.nodes.doc.create(null, lines);
}

/**
 * The caption a document says, written with its marks.
 * @param document - The document typed in.
 * @returns The caption, with its marks.
 */
export function captionText(document: Node): string {
  const lines: Span[][] = [];
  for (const line of document.children) {
    const spans: Span[] = [];
    for (const child of line.children) {
      spans.push(spanOf(child.text ?? '', child.marks));
    }
    lines.push(spans);
  }
  return writeRichText(lines);
}

function marksOf(span: Span): Mark[] {
  const { marks } = captionSchema;
  const set: Mark[] = [];
  if (span.size !== undefined) {
    set.push(marks.size.create({ points: span.size }));
  }
  if (span.bold) set.push(marks.bold.create());
  if (span.italic) set.push(marks.italic.create());
  if (span.script) set.push(marks[span.script].create());
  return set;
}

function spanOf(text: string, marks: readonly Mark[]): Span {
  const span: Span = { text };
  for (const mark of marks) {
    const name = mark.type.name;
    if (name === 'size') span.size = mark.attrs.points as number;
    else if (name === 'bold') span.bold = true;
    else if (name === 'italic') span.italic = true;
    else if (name === 'sub' || name === 'sup') span.script = name;
  }
  return span;
}
