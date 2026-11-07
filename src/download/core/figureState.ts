/**
 * What a site needs to open one of its figures again exactly as it was,
 * carried inside the figure: the conformers 3d computed, the geometry lcao
 * relaxed, the plate tlc read.
 *
 * An address names what to compute; a state is what was computed. A figure
 * carrying its state opens again at once, with nothing computed anew, and the
 * same — whatever the site has learnt to compute differently since. The family
 * agrees on the envelope: gzipped JSON in base64, the version of the site's
 * format, and a digest of the picture it was written with. What is inside is
 * the site's own, and only that site reads it.
 */

import {
  FIGURE_STATE_ENCODING,
  packFigureValue,
  unpackFigureValue,
} from './figurePacking.ts';
import {
  attribute,
  findSource,
  readSourceTag,
  sourceChildren,
  withoutFigureSource,
} from './figureSourceMarkup.ts';

/** What a site needs to open one of its figures again, in its own format. */
export interface FigureState {
  /**
   * The version of the site's format, a whole number from 1, so the site
   * reads only what it knows and refuses what a newer version wrote.
   */
  version: number;
  /** The state, as JSON writes it. */
  value: unknown;
}

/** A state as a figure carries it. */
export interface CarriedFigureState extends FigureState {
  /** The site that wrote it, as the family names it, e.g. `3d`. */
  site: string;
  /**
   * The page as it stood when the figure was drawn, as its source names it:
   * what the address holds — the camera, the conformer on screen — the site
   * puts back beside the state.
   */
  href: string;
  /**
   * Whether the picture was changed since the state was written — redrawn in
   * another program — so the state draws something other than the picture
   * shows, and opening it would lose that change.
   */
  edited: boolean;
}

/**
 * The element a figure's source carries its state in.
 * @param state - The state.
 * @param figure - The figure it is written with, without its source.
 * @returns The element's markup.
 * @throws {Error} When the version is not a whole number from 1.
 */
export async function stateElement(
  state: FigureState,
  figure: string,
): Promise<string> {
  const { version, value } = state;
  if (!Number.isSafeInteger(version) || version < 1) {
    throw new Error(
      `A figure's state is versioned from 1, in whole numbers, not ${version}.`,
    );
  }
  const [packed, digest] = await Promise.all([
    packFigureValue(value),
    figureDigest(figure),
  ]);
  const signed = digest === undefined ? '' : ` digest="${digest}"`;
  return `<cheminfo:state version="${version}"${signed} encoding="${FIGURE_STATE_ENCODING}">${packed}</cheminfo:state>`;
}

/**
 * The state a figure carries, when a site of the family wrote one. A state
 * that does not unpack, or would grow past `MAX_FIGURE_STATE_BYTES`, is none.
 * @param svg - The figure, as an SVG document, from anywhere.
 * @param site - The site whose state is wanted; another site's is none.
 * @returns The state, or `undefined` when the figure carries none.
 */
export async function readFigureState(
  svg: string,
  site?: string,
): Promise<CarriedFigureState | undefined> {
  const found = findSource(svg);
  if (found === undefined) return undefined;
  const named = readSourceTag(found);
  if (named === undefined || (site !== undefined && named.site !== site)) {
    return undefined;
  }
  const [element] = sourceChildren(found, 'state');
  if (element === undefined) return undefined;
  const version = Number(attribute(element.tag, 'version'));
  if (
    !Number.isSafeInteger(version) ||
    version < 1 ||
    attribute(element.tag, 'encoding') !== FIGURE_STATE_ENCODING
  ) {
    return undefined;
  }
  let value: unknown;
  try {
    value = await unpackFigureValue(element.text);
  } catch {
    return undefined;
  }
  const digest = attribute(element.tag, 'digest');
  const now =
    digest === undefined
      ? undefined
      : await figureDigest(withoutFigureSource(svg));
  return {
    site: named.site,
    href: named.href,
    version,
    value,
    edited: now !== undefined && now !== digest,
  };
}

/**
 * A digest of what a figure draws: SHA-256, in hexadecimal, of everything
 * inside its root element, white space folded, so a program that only
 * reindents it, or names its root's namespaces, has not changed it.
 * @param figure - The figure, without its source.
 * @returns The digest, or `undefined` where the browser offers no digests (a
 * page served over plain HTTP) or the figure has no root.
 */
export async function figureDigest(
  figure: string,
): Promise<string | undefined> {
  const subtle = globalThis.crypto?.subtle as SubtleCrypto | undefined;
  const root = /<svg\b[^>]*>/i.exec(figure);
  if (subtle === undefined || root === null || root[0].endsWith('/>')) {
    return undefined;
  }
  const start = root.index + root[0].length;
  const end = figure.lastIndexOf('</svg>');
  if (end < start) return undefined;
  const body = figure.slice(start, end).replaceAll(/\s+/g, ' ').trim();
  const hash = new Uint8Array(
    await subtle.digest('SHA-256', new TextEncoder().encode(body)),
  );
  let hex = '';
  for (const byte of hash) hex += byte.toString(16).padStart(2, '0');
  return hex;
}
