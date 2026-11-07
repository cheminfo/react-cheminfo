/**
 * Where a figure came from, written into the figure: the site that drew it,
 * the address of the page as it stood, and — when the address does not say it
 * all — the values the page was drawn from.
 *
 * Every site of the family keeps what is on screen in its address — the
 * structure, the conformer and the camera of 3d, the property and the elements
 * picked of the periodic table — so the address is most of what a figure needs
 * to be changed again: a host frames the site at it, a reader opens it on its
 * own. What no address holds, a measured spectrum, the figure carries itself,
 * and a host hands it back to the site. What the page computed — conformers,
 * a relaxed geometry, a plate — it may carry as its state, so the figure opens
 * again with nothing computed anew (`figureState.ts`).
 */

import { CARD_PARAM } from '../../card/core/cardAddress.ts';
import {
  formatQueryEntries,
  parseQueryEntries,
} from '../../router/core/query.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';
import { escapeAttribute } from '../../share/core/escape.ts';
import { FIGURE_PARAM } from '../../share/core/figureParam.ts';

import type { FigureInput } from './figureInputs.ts';
import {
  FIGURE_INPUT_ENCODING,
  MAX_FIGURE_INPUTS,
  packFigureInput,
  unpackFigureInput,
} from './figureInputs.ts';
import {
  FIGURE_SOURCE_NAMESPACE,
  attribute,
  findSource,
  readSourceTag,
  sourceChildren,
  withoutFigureSource,
} from './figureSourceMarkup.ts';
import type { FigureState } from './figureState.ts';
import { stateElement } from './figureState.ts';

export { FIGURE_SOURCE_NAMESPACE } from './figureSourceMarkup.ts';

/** Where a figure came from. */
export interface FigureSource {
  /** The site that drew it, as the family names it, e.g. `3d`. */
  site: string;
  /** The page as it stood, e.g. `https://3d.cheminfo.org/?smiles=CCO&view=…`. */
  href: string;
  /**
   * The values the page was drawn from that its address does not hold — a
   * measured spectrum — in the kinds the site takes them in.
   * @default undefined — the address is the whole page
   */
  inputs?: readonly FigureInput[];
  /**
   * What the page computed, in the site's own format, so the figure opens
   * again as it was with nothing computed anew. Only the site reads it.
   * @default undefined — the address and the inputs redraw the page
   */
  state?: FigureState;
}

// What only a framing page asks for: the figure itself never depends on it.
const FRAME_PARAMS: ReadonlySet<string> = new Set([
  EMBED_PARAM,
  HIDE_PARAM,
  CARD_PARAM,
  FIGURE_PARAM,
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
 * name or an address that does not read is no source. The values it was drawn
 * from are unpacked by `readFigureInputs`, when they are wanted.
 * @param svg - The figure, as an SVG document.
 * @returns The source, or `undefined` when the figure names none.
 */
export function readFigureSource(svg: string): FigureSource | undefined {
  const found = findSource(svg);
  return found === undefined ? undefined : readSourceTag(found);
}

/**
 * The values a figure was drawn from, as it carries them. One that does not
 * unpack is left out, so a figure damaged on the way, or written by a newer
 * site, still opens on what can be read.
 * @param svg - The figure, as an SVG document.
 * @returns The values, in the order written; none when it carries none.
 */
export async function readFigureInputs(svg: string): Promise<FigureInput[]> {
  const found = findSource(svg);
  if (found === undefined || readSourceTag(found) === undefined) return [];
  const written = sourceChildren(found, 'input').slice(0, MAX_FIGURE_INPUTS);
  const read = await Promise.all(
    written.map((child) => readInput(child.tag, child.text)),
  );
  return read.filter((input) => input !== undefined);
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
  const open = `<cheminfo:source xmlns:cheminfo="${FIGURE_SOURCE_NAMESPACE}" site="${escapeAttribute(source.site)}" href="${escapeAttribute(source.href)}"`;
  const written = await Promise.all((source.inputs ?? []).map(inputElement));
  if (source.state !== undefined) {
    written.push(await stateElement(source.state, figure));
  }
  if (written.length === 0) return `${open}/>`;
  return `${open}>${written.join('')}</cheminfo:source>`;
}

async function inputElement(input: FigureInput): Promise<string> {
  const key =
    input.key === undefined ? '' : ` key="${escapeAttribute(input.key)}"`;
  const label =
    input.label === undefined ? '' : ` label="${escapeAttribute(input.label)}"`;
  const packed = await packFigureInput(input.value);
  return `<cheminfo:input kind="${escapeAttribute(input.kind)}"${key}${label} encoding="${FIGURE_INPUT_ENCODING}">${packed}</cheminfo:input>`;
}

async function readInput(
  tag: string,
  text: string,
): Promise<FigureInput | undefined> {
  const kind = attribute(tag, 'kind');
  if (!kind || attribute(tag, 'encoding') !== FIGURE_INPUT_ENCODING) {
    return undefined;
  }
  let value: unknown;
  try {
    value = await unpackFigureInput(text);
  } catch {
    return undefined;
  }
  const key = attribute(tag, 'key');
  const label = attribute(tag, 'label');
  return {
    kind,
    value,
    ...(key === undefined ? {} : { key }),
    ...(label === undefined ? {} : { label }),
  };
}
