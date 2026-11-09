/**
 * Where a figure came from, written into the figure: the site that drew it,
 * the address of the page as it stood, the build that wrote it, and the state
 * the site opens it again from, in its three parts — data, view and
 * preferences (`figureState.ts`).
 *
 * The state is what makes a figure a document rather than a picture: the
 * structure and conformers of 3d, the geometry of lcao, the plate of tlc, the
 * spectra of chemcalc, the table of periodic-table, the drawing of draw. The
 * site reads it back from the file, or from a host handing the figure over
 * whole, and shows the page as it was, with nothing computed anew. The address
 * says only where to open it, and what the camera looked at.
 */

import { CARD_PARAM } from '../../card/core/cardAddress.ts';
import {
  formatQueryEntries,
  parseQueryEntries,
} from '../../router/core/query.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';
import { escapeAttribute } from '../../share/core/escape.ts';

import { figureRevision } from './figureRevision.ts';
import {
  FIGURE_SOURCE_NAMESPACE,
  attribute,
  findSource,
  readSourceTag,
  withoutFigureSource,
} from './figureSourceMarkup.ts';
import type { FigureStates } from './figureState.ts';
import { figureDigest, stateElements } from './figureState.ts';

export { FIGURE_SOURCE_NAMESPACE } from './figureSourceMarkup.ts';

/**
 * Where a figure came from, and the state the site opens it again from: what
 * it is (`data`), where it stood (`view`) and the workspace it was made in
 * (`preferences`), each in the site's own format, which only that site reads.
 */
export interface FigureSource extends FigureStates {
  /** The site that drew it, as the family names it, e.g. `3d`. */
  site: string;
  /** The page as it stood, e.g. `https://3d.cheminfo.org/?smiles=CCO&view=…`. */
  href: string;
  /**
   * The build that wrote it, e.g. `draw.cheminfo.org 1.4.0`.
   * @default undefined — not said
   */
  generator?: string;
  /**
   * The deployment that wrote it, e.g. `https://1a2b3c4d.draw-cheminfo.pages.dev`,
   * where it opens again as it was saved (`savedRevisionAddress`). Written by
   * default when the page runs the figure's site on Cloudflare Pages.
   * @default the running deployment, else undefined
   */
  revision?: string;
}

// What only a framing page asks for: the figure itself never depends on it.
const FRAME_PARAMS: ReadonlySet<string> = new Set([
  EMBED_PARAM,
  HIDE_PARAM,
  CARD_PARAM,
]);

/**
 * Write where a figure came from into its SVG, in place of any source it
 * named before. It goes into the figure's own `<metadata>` when it has one, so
 * a file that keeps its data there, and leaves that element out of what it
 * checks, still checks the same.
 * @param svg - The figure, as an SVG document.
 * @param source - Where it came from, and what it was drawn from.
 * @returns The figure, saying where it came from.
 */
export async function withFigureSource(
  svg: string,
  source: FigureSource,
): Promise<string> {
  const text = withoutFigureSource(svg);
  const element = await sourceElement(source, text);
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
 * Where a figure came from, as its SVG says: the site and the page. A site
 * name or an address that does not read is no source. Its state is read by
 * `readFigureStates`, when it is wanted.
 * @param svg - The figure, as an SVG document.
 * @returns The source, or `undefined` when the figure names none.
 */
export function readFigureSource(svg: string): FigureSource | undefined {
  const found = findSource(svg);
  if (found === undefined) return undefined;
  const named = readSourceTag(found);
  if (named === undefined) return undefined;
  const generator = attribute(found.tag, 'generator');
  const revision = attribute(found.tag, 'revision');
  return {
    ...named,
    ...(generator === undefined ? {} : { generator }),
    ...(revision === undefined ? {} : { revision }),
  };
}

/**
 * The address a figure records: the page's own, without what only a framing
 * page asks for — the dropped chrome, the parts left out, the card — so it
 * opens the page whole, and a host adds its own framing back.
 * @param href - The page's address, as the location holds it.
 * @returns The address.
 */
export function figureAddress(href: string): string {
  const url = new URL(href);
  const entries = parseQueryEntries(url.search).filter(
    ([key]) => !FRAME_PARAMS.has(key),
  );
  const query = formatQueryEntries(entries);
  return `${url.origin}${url.pathname}${query === '' ? '' : `?${query}`}`;
}

async function sourceElement(
  source: FigureSource,
  figure: string,
): Promise<string> {
  const revision = source.revision ?? figureRevision(source.site);
  const attributes = [
    `site="${escapeAttribute(source.site)}"`,
    `href="${escapeAttribute(source.href)}"`,
    ...(source.generator === undefined
      ? []
      : [`generator="${escapeAttribute(source.generator)}"`]),
    ...(revision === undefined
      ? []
      : [`revision="${escapeAttribute(revision)}"`]),
  ];
  const open = `<cheminfo:source xmlns:cheminfo="${FIGURE_SOURCE_NAMESPACE}" ${attributes.join(' ')}`;
  const [parts, digest] = await Promise.all([
    stateElements(source),
    figureDigest(figure),
  ]);
  if (parts === '') return `${open}/>`;
  const signed = digest === undefined ? '' : ` digest="${digest}"`;
  return `${open}${signed}>${parts}</cheminfo:source>`;
}
