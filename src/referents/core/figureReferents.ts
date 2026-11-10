/**
 * The referents a figure carries, written into its `<metadata>` as JSON and
 * read back from it. Plain string work, as for the figure's source: a figure
 * may come from any program, and is read before anything trusts it.
 */

import { escapeText } from '../../share/core/escape.ts';

import { readReferents } from './readReferents.ts';
import type { FigureReferents } from './types.ts';

/** The namespace the referents are written in, which names them whatever their prefix. */
export const FIGURE_REFERENTS_NAMESPACE =
  'https://www.cheminfo.org/ns/referents/1';

/**
 * Write what a figure numbers into its SVG, in place of what it carried. A
 * figure numbering nothing is written without any.
 * @param svg - The figure, as an SVG document.
 * @param referents - What it numbers.
 * @returns The figure.
 */
export function withFigureReferents(
  svg: string,
  referents: FigureReferents,
): string {
  const text = withoutFigureReferents(svg);
  if (referents.referents.length === 0 && referents.series.length === 0) {
    return text;
  }
  const element = `<cheminfo:referents xmlns:cheminfo="${FIGURE_REFERENTS_NAMESPACE}">${escapeText(JSON.stringify(referents))}</cheminfo:referents>`;
  const root = /<svg\b[^>]*>/i.exec(text);
  if (!root || root[0].endsWith('/>')) return svg;
  const after = root.index + root[0].length;
  const metadata = /<metadata(?:\s[^>]*)?>/.exec(text.slice(after));
  if (metadata) {
    const inside = after + metadata.index + metadata[0].length;
    return `${text.slice(0, inside)}${element}${text.slice(inside)}`;
  }
  return `${text.slice(0, after)}<metadata>${element}</metadata>${text.slice(after)}`;
}

/**
 * What a figure numbers, as its SVG says. What does not read is left out: an
 * entry without a key, a box that is not four numbers.
 * @param svg - The figure, as an SVG document.
 * @returns What it numbers, or `undefined` when it says nothing.
 */
export function readFigureReferents(svg: string): FigureReferents | undefined {
  const found = findReferents(svg);
  if (found === undefined) return undefined;
  try {
    return readReferents(JSON.parse(unescapeText(found.body)));
  } catch {
    return undefined;
  }
}

/**
 * A figure without the referents written into it.
 * @param svg - The figure, as an SVG document.
 * @returns The figure.
 */
export function withoutFigureReferents(svg: string): string {
  const found = findReferents(svg);
  if (found === undefined) return svg;
  return `${svg.slice(0, found.start)}${svg.slice(found.end)}`.replace(
    '<metadata></metadata>',
    '',
  );
}

interface FoundReferents {
  start: number;
  end: number;
  body: string;
}

function findReferents(svg: string): FoundReferents | undefined {
  const prefix = new RegExp(
    String.raw`xmlns:(?<prefix>[A-Za-z_][\w.-]*)\s*=\s*["']${escapeRegExp(FIGURE_REFERENTS_NAMESPACE)}["']`,
  ).exec(svg)?.groups?.prefix;
  if (prefix === undefined) return undefined;
  const name = escapeRegExp(`${prefix}:referents`);
  const match = new RegExp(
    String.raw`<${name}\b[^>]*>(?<body>[^<]*)</${name}\s*>`,
  ).exec(svg);
  if (match === null) return undefined;
  return {
    start: match.index,
    end: match.index + match[0].length,
    body: match.groups?.body ?? '',
  };
}

function unescapeText(value: string): string {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
