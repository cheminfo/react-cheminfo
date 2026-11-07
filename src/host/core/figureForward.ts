/**
 * A figure dropped on the wrong site of the family, sent on to the site that
 * drew it. The figure names that site and the page it was drawn on; the site
 * is looked up in the family's registry, so the page opens on the host the
 * family knows, never on an origin the file writes — a file from anywhere
 * cannot send the reader to an address of its choosing.
 */

import { readFigureSource } from '../../download/core/figureSource.ts';
import { findSiteById } from '../../ecosystem/core/lookup.ts';

import type { ToolDocument } from './connectTool.ts';
import { FIGURE_INPUT } from './figureDocument.ts';

/** Where a figure belongs: the site that drew it, and the page to open. */
export interface FigureDestination {
  /** The site, as the family names it, e.g. `lcao`. */
  site: string;
  /**
   * The page the figure was drawn on, on the host the family knows for the
   * site, e.g. `https://lcao.cheminfo.org/playground?smiles=C`.
   */
  url: string;
}

/**
 * Where a figure dropped on a site belongs, when another site of the family
 * drew it.
 * @param svg - The figure, as an SVG document.
 * @param site - The site it was dropped on, e.g. `3d`.
 * @param origins - The origin to open each site on instead of its own, as a
 * development server names its siblings running locally.
 * @default {}
 * @returns The destination, or `undefined` for a figure of this site, one
 * that names no site, or one of a site the family does not know.
 */
export function figureDestination(
  svg: string,
  site: string,
  origins: Readonly<Record<string, string>> = {},
): FigureDestination | undefined {
  const source = readFigureSource(svg);
  if (source === undefined || source.site === site) return undefined;
  const known = findSiteById(source.site);
  const origin =
    origins[source.site] ??
    (known === undefined ? undefined : `https://${known.host}`);
  if (origin === undefined || !URL.canParse(source.href)) return undefined;
  const page = new URL(source.href);
  return {
    site: source.site,
    url: new URL(`${page.pathname}${page.search}`, origin).href,
  };
}

/**
 * The document a forwarded figure is handed over as: the figure on the
 * `figure` input, which every site opening its own figures takes.
 * @param svg - The figure.
 * @returns The document.
 */
export function forwardedFigureDocument(svg: string): ToolDocument {
  return {
    document: 'forwarded-figure',
    items: [{ key: FIGURE_INPUT.key, kind: 'image.svg', value: { svg } }],
  };
}
