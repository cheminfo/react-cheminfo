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
 * and a host hands it back to the site.
 */

import { CARD_PARAM } from '../../card/core/cardAddress.ts';
import {
  formatQueryEntries,
  parseQueryEntries,
} from '../../router/core/query.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';
import { escapeAttribute } from '../../share/core/escape.ts';

import type { FigureInput } from './figureInputs.ts';
import {
  FIGURE_INPUT_ENCODING,
  MAX_FIGURE_INPUTS,
  packFigureInput,
  unpackFigureInput,
} from './figureInputs.ts';

/** The namespace the source is written in, which names it whatever its prefix. */
export const FIGURE_SOURCE_NAMESPACE =
  'https://www.cheminfo.org/ns/figure-source';

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
}

/** Where the source sits in a figure, as written there. */
interface FoundSource {
  /** The prefix its namespace is bound to. */
  prefix: string;
  /** Its opening tag. */
  tag: string;
  /** What it holds: the values the figure was drawn from. */
  body: string;
}

// What only a framing page asks for: the figure itself never depends on it.
const FRAME_PARAMS: ReadonlySet<string> = new Set([
  EMBED_PARAM,
  HIDE_PARAM,
  CARD_PARAM,
]);

const SITE = /^[a-z\d]+(?:-[a-z\d]+)*$/;

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
  const element = await sourceElement(source);
  const text = withoutFigureSource(svg);
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
  if (found === undefined) return undefined;
  const site = attribute(found.tag, 'site');
  const href = attribute(found.tag, 'href');
  if (site === undefined || !SITE.test(site) || href === undefined) {
    return undefined;
  }
  if (!URL.canParse(href) || !/^https?:$/.test(new URL(href).protocol)) {
    return undefined;
  }
  return { site, href };
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
  if (found === undefined || readFigureSource(svg) === undefined) return [];
  const name = `${escapeRegExp(found.prefix)}:input`;
  const pattern = new RegExp(
    String.raw`<${name}\b(?<attributes>[^>]*)>(?<text>[^<]*)</${name}\s*>`,
    'g',
  );
  const written = [...found.body.matchAll(pattern)].slice(0, MAX_FIGURE_INPUTS);
  const read = await Promise.all(
    written.map((match) =>
      readInput(match.groups?.attributes ?? '', match.groups?.text ?? ''),
    ),
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

async function sourceElement(source: FigureSource): Promise<string> {
  const open = `<cheminfo:source xmlns:cheminfo="${FIGURE_SOURCE_NAMESPACE}" site="${escapeAttribute(source.site)}" href="${escapeAttribute(source.href)}"`;
  const inputs = source.inputs ?? [];
  if (inputs.length === 0) return `${open}/>`;
  const written = await Promise.all(inputs.map(inputElement));
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
  attributes: string,
  text: string,
): Promise<FigureInput | undefined> {
  const tag = `<input${attributes}>`;
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

function findSource(svg: string): FoundSource | undefined {
  const prefix = new RegExp(
    String.raw`xmlns:(?<prefix>[A-Za-z_][\w.-]*)\s*=\s*["']${escapeRegExp(FIGURE_SOURCE_NAMESPACE)}["']`,
  ).exec(svg)?.groups?.prefix;
  if (prefix === undefined) return undefined;
  const name = `${prefix}:source`;
  const open = new RegExp(String.raw`<${escapeRegExp(name)}\b[^>]*>`).exec(svg);
  if (open === null) return undefined;
  const tag = open[0];
  if (tag.endsWith('/>')) return { prefix, tag, body: '' };
  const start = open.index + tag.length;
  const end = svg.indexOf(`</${name}`, start);
  return { prefix, tag, body: end === -1 ? '' : svg.slice(start, end) };
}

function withoutFigureSource(svg: string): string {
  return svg
    .replace(
      new RegExp(
        String.raw`<cheminfo:source xmlns:cheminfo="${escapeRegExp(FIGURE_SOURCE_NAMESPACE)}"[^>]*?(?:/>|>[\s\S]*?</cheminfo:source>)`,
      ),
      '',
    )
    .replace('<metadata></metadata>', '');
}

function attribute(tag: string, name: string): string | undefined {
  const groups = new RegExp(
    String.raw`\s${name}\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)')`,
  ).exec(tag)?.groups;
  const value = groups?.double ?? groups?.single;
  return value === undefined ? undefined : unescapeAttribute(value);
}

function unescapeAttribute(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
