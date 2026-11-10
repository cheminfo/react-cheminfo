/**
 * The labels a figure draws: `<text>` or `<tspan>` elements carrying
 * `data-cheminfo-ref` (and `data-cheminfo-row` for a member), whose text is
 * the number they last showed. A document writes its own numbers over them.
 */

import { escapeAttribute, escapeText } from '../../share/core/escape.ts';

import type { ReferentMention } from './types.ts';

/** The attribute naming the referent a label shows. */
export const REFERENT_ATTRIBUTE = 'data-cheminfo-ref';

/** The attribute naming the row of its series, for a member. */
export const REFERENT_ROW_ATTRIBUTE = 'data-cheminfo-row';

const LABEL =
  /<(?<tag>text|tspan)\b(?<attributes>[^>]*\sdata-cheminfo-ref\s*=\s*"[^"]*"[^>]*)>(?<body>[\s\S]*?)<\/\k<tag>\s*>/g;

/**
 * The attributes a label carries, ready to be written into its opening tag.
 * @param mention - What it shows.
 * @returns ` data-cheminfo-ref="…"`, and the row when there is one.
 */
export function labelAttributes(mention: ReferentMention): string {
  const row =
    mention.row === undefined
      ? ''
      : ` ${REFERENT_ROW_ATTRIBUTE}="${escapeAttribute(mention.row)}"`;
  return ` ${REFERENT_ATTRIBUTE}="${escapeAttribute(mention.key)}"${row}`;
}

/**
 * The labels of a figure, in the order written.
 * @param svg - The figure, as an SVG document.
 * @returns What each one shows, and the text it shows now.
 */
export function readFigureLabels(
  svg: string,
): Array<ReferentMention & { text: string }> {
  const labels: Array<ReferentMention & { text: string }> = [];
  for (const match of svg.matchAll(LABEL)) {
    const { attributes = '', body = '' } = match.groups ?? {};
    labels.push({
      ...mentionOf(attributes),
      text: unescapeText(body.replaceAll(/<[^>]*>/g, '')),
    });
  }
  return labels;
}

/**
 * A figure whose labels read what a document says they read.
 * @param svg - The figure, as an SVG document.
 * @param read - What a label showing a referent, or a member, reads.
 * @returns The figure, the same string when no label changed.
 */
export function relabelFigure(
  svg: string,
  read: (mention: ReferentMention) => string,
): string {
  return svg.replaceAll(LABEL, (whole, ...rest: unknown[]) => {
    const groups = rest.at(-1) as Record<string, string>;
    const { tag = '', attributes = '', body = '' } = groups;
    const text = escapeText(read(mentionOf(attributes)));
    if (body === text) return whole;
    return `<${tag}${attributes}>${text}</${tag}>`;
  });
}

function mentionOf(attributes: string): ReferentMention {
  const key = attributeOf(attributes, REFERENT_ATTRIBUTE) ?? '';
  const row = attributeOf(attributes, REFERENT_ROW_ATTRIBUTE);
  return row === undefined ? { key } : { key, row };
}

function attributeOf(attributes: string, name: string): string | undefined {
  const value = new RegExp(String.raw`\s${name}\s*=\s*"(?<value>[^"]*)"`).exec(
    attributes,
  )?.groups?.value;
  return value === undefined ? undefined : unescapeText(value);
}

function unescapeText(value: string): string {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
}
