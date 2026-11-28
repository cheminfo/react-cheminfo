/**
 * A figure a test rendered, cut out of its markup as an SVG file of its own —
 * the empty guide's faint figures, a bench's still: the namespace and the
 * family's font on its root, and every family token it is inked with written
 * out, since a file served on its own has no stylesheet to read them from.
 */

import {
  FAMILY_FONT,
  FAMILY_TOKEN_VALUES,
} from '../../tokens/core/familyTokens.ts';

import { resolveCssTokens } from './cssTokens.ts';
import { SVG_NAMESPACE } from './svgNamespace.ts';

/** Which figure of the markup is cut out. */
export interface StandaloneSvgOptions {
  /**
   * The `data-figure-name` the figure carries.
   * @default undefined — the first `<svg>`, to the last `</svg>`
   */
  name?: string;
}

// Read by any name, so a token the family does not declare finds nothing.
const FAMILY_VALUES: Readonly<Record<string, string | undefined>> =
  FAMILY_TOKEN_VALUES;

// A token whose fallback is itself a call, `var(--x, rgba(…))`, which
// `resolveCssTokens` leaves as written.
const BRACKETED_FALLBACK =
  /var\(\s*(?<name>--[\w-]+)\s*,\s*(?<fallback>[^()]*\([^()]*\)[^()]*?)\s*\)/gu;

/**
 * Cut a figure out of rendered markup as a standalone SVG document.
 * @param markup - The markup, as `renderToStaticMarkup` wrote it.
 * @param options - Which figure: the one named, or the first.
 * @returns The SVG, its root carrying the namespace, its size, a view box and
 * the family font.
 * @throws {Error} When there is no such figure, it holds another SVG, it has
 * no size, or it reads a token the family does not declare.
 */
export function standaloneSvg(
  markup: string,
  options: StandaloneSvgOptions = {},
): string {
  const { name } = options;
  const start =
    name === undefined
      ? markup.indexOf('<svg')
      : markup.search(new RegExp(`<svg[^>]*data-figure-name="${name}"`, 'u'));
  if (start === -1) {
    throw new Error(
      name === undefined
        ? 'the markup holds no figure'
        : `no figure named ${name}`,
    );
  }
  const tagEnd = markup.indexOf('>', start);
  const end =
    name === undefined
      ? markup.lastIndexOf('</svg>')
      : markup.indexOf('</svg>', tagEnd);
  const body = markup.slice(tagEnd + 1, end);
  if (body.includes('<svg')) throw new Error('the figure holds another SVG');

  const tag = markup.slice(start, tagEnd);
  const width = attribute(tag, 'width');
  const height = attribute(tag, 'height');
  const inked = resolveCssTokens(
    body.replaceAll(
      BRACKETED_FALLBACK,
      (_call: string, token: string, fallback: string) =>
        FAMILY_VALUES[token] ?? fallback,
    ),
    FAMILY_TOKEN_VALUES,
  );
  if (inked.includes('var(')) {
    throw new Error('the figure reads a token the family does not declare');
  }
  return `<svg xmlns="${SVG_NAMESPACE}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FAMILY_FONT}">${inked}</svg>`;
}

function attribute(tag: string, name: string): string {
  const value = new RegExp(String.raw`\s${name}="([^"]*)"`, 'u').exec(tag)?.[1];
  if (value === undefined) throw new Error(`the figure has no ${name}`);
  return value;
}
