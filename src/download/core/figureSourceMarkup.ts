/**
 * The source a figure carries, read out of its markup and taken out of it
 * again. Plain string work: a figure may come from any program, and is read
 * before anything trusts it.
 */

/** The namespace the source is written in, which names it whatever its prefix. */
export const FIGURE_SOURCE_NAMESPACE = 'https://www.cheminfo.org/ns/source/2';

/** Where the source sits in a figure, as written there. */
export interface FoundSource {
  /** The prefix its namespace is bound to. */
  prefix: string;
  /** Its opening tag. */
  tag: string;
  /** What it holds: the parts of the figure's state. */
  body: string;
}

/** One element the source holds, as written there. */
export interface SourceChild {
  /** Its opening tag, with its name cut down to the local one: `<data …>`. */
  tag: string;
  /** Its text. */
  text: string;
}

const SITE = /^[a-z\d]+(?:-[a-z\d]+)*$/;

/**
 * Find the source in a figure.
 * @param svg - The figure, as an SVG document.
 * @returns Where it is, or `undefined` when the figure binds no prefix to its
 * namespace or holds no source.
 */
export function findSource(svg: string): FoundSource | undefined {
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

/**
 * The site and the page a source names, when both read: a site named as the
 * family names its sites, and an http(s) address.
 * @param found - The source.
 * @returns The two, or `undefined`.
 */
export function readSourceTag(
  found: FoundSource,
): { site: string; href: string } | undefined {
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
 * The elements of one name a source holds, in the order written.
 * @param found - The source.
 * @param name - Their local name, e.g. `data`.
 * @returns Each one's opening tag and text.
 */
export function sourceChildren(
  found: FoundSource,
  name: string,
): SourceChild[] {
  const qualified = `${escapeRegExp(found.prefix)}:${name}`;
  const pattern = new RegExp(
    String.raw`<${qualified}\b(?<attributes>[^>]*)>(?<text>[^<]*)</${qualified}\s*>`,
    'g',
  );
  const children: SourceChild[] = [];
  for (const match of found.body.matchAll(pattern)) {
    children.push({
      tag: `<${name}${match.groups?.attributes ?? ''}>`,
      text: match.groups?.text ?? '',
    });
  }
  return children;
}

/**
 * A figure without the source written into it, exactly as it was before.
 * @param svg - The figure, as an SVG document.
 * @returns The figure.
 */
export function withoutFigureSource(svg: string): string {
  return svg
    .replace(
      new RegExp(
        String.raw`<cheminfo:source xmlns:cheminfo="${escapeRegExp(FIGURE_SOURCE_NAMESPACE)}"[^>]*?(?:/>|>[\s\S]*?</cheminfo:source>)`,
      ),
      '',
    )
    .replace('<metadata></metadata>', '');
}

/**
 * The value of one attribute of a tag, unescaped.
 * @param tag - The tag.
 * @param name - The attribute.
 * @returns Its value, or `undefined` when the tag has none.
 */
export function attribute(tag: string, name: string): string | undefined {
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
