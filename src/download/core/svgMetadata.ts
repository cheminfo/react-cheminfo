/**
 * The `<metadata>` of an SVG document, written and read as text: where a
 * figure of the family keeps what it came from and what it numbers.
 */

import { escapeRegExp } from '../../share/core/escape.ts';

/**
 * The figure with one element added to its `<metadata>`, which is made when
 * the figure has none.
 * @param svg - The figure, as an SVG document.
 * @param element - The element to add, as markup.
 * @returns The figure, or `undefined` when it has no `<svg>` root to hold it.
 */
export function withMetadataElement(
  svg: string,
  element: string,
): string | undefined {
  const root = /<svg\b[^>]*>/i.exec(svg);
  if (!root || root[0].endsWith('/>')) return undefined;
  const after = root.index + root[0].length;
  const metadata = /<metadata(?:\s[^>]*)?>/.exec(svg.slice(after));
  if (metadata) {
    const inside = after + metadata.index + metadata[0].length;
    return `${svg.slice(0, inside)}${element}${svg.slice(inside)}`;
  }
  return `${svg.slice(0, after)}<metadata>${element}</metadata>${svg.slice(after)}`;
}

/**
 * The figure without the empty `<metadata>` taking an element out left behind.
 * @param svg - The figure, as an SVG document.
 * @returns The figure.
 */
export function withoutEmptyMetadata(svg: string): string {
  return svg.replace('<metadata></metadata>', '');
}

/**
 * The prefix a figure binds a namespace to, which the elements of that
 * namespace are then named with.
 * @param svg - The figure, as an SVG document.
 * @param namespace - The namespace.
 * @returns The prefix, or `undefined` when the figure binds none to it.
 */
export function boundPrefix(
  svg: string,
  namespace: string,
): string | undefined {
  return new RegExp(
    String.raw`xmlns:(?<prefix>[A-Za-z_][\w.-]*)\s*=\s*["']${escapeRegExp(namespace)}["']`,
  ).exec(svg)?.groups?.prefix;
}
