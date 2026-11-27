/**
 * A reference formatted by citeproc-js, written for the places it is pasted
 * into: Markdown for a README or an issue, keeping the style's italics and
 * bold.
 */

import { unescapeXml } from '../../share/core/escape.ts';

/**
 * A formatted reference as one line of Markdown: italics and bold kept, a
 * raised or lowered run kept as the HTML Markdown allows, every other tag
 * dropped and its text kept.
 * @param html - What citeproc-js wrote.
 * @returns The Markdown.
 */
export function markdownOfHtml(html: string): string {
  const marked = html.replaceAll(
    /<(?<closing>\/?)(?<tag>[a-z]+)[^>]*>/gi,
    (_, closing: string, tag: string) => {
      const name = tag.toLowerCase();
      if (name === 'i' || name === 'em') return '*';
      if (name === 'b' || name === 'strong') return '**';
      if (name === 'sup' || name === 'sub') return `<${closing}${name}>`;
      return '';
    },
  );
  return unescapeXml(marked);
}
