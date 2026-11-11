/**
 * What a site needs to open one of its figures again exactly as it was,
 * carried inside the figure, in three parts every file of the family names
 * alike:
 *
 * - **data**: what the figure is — the drawing, the structure and its
 *   conformers, the plate, the spectra. Always written when the site can open
 *   the figure again.
 * - **view**: where it stood — the camera, the page shown, what was selected.
 * - **preferences**: the workspace it was made in — the panels and their
 *   settings, how things are displayed.
 *
 * What is inside each part is the site's own, versioned by the site; the
 * family agrees on the envelope. A part is written as JSON a person can read,
 * gzipped in base64 once it is large, and the figure states a digest of the
 * picture it was written with, so a picture redrawn in another program is
 * known for one.
 */

import { isSameSite } from '../../ecosystem/core/lookup.ts';

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

/** The parts a figure carries its state in, in the order they are written. */
export const STATE_PARTS = ['data', 'view', 'preferences'] as const;

/** One of the parts of a figure's state. */
export type StatePart = (typeof STATE_PARTS)[number];

/** How a part is written when it is read as it stands. */
export const JSON_ENCODING = 'json';

/**
 * How large a part is written as JSON, in UTF-8 bytes; a larger one is
 * gzipped, in base64.
 */
export const READABLE_STATE_BYTES = 32 * 1024;

/** One part of a figure's state, in the site's own format. */
export interface SiteState {
  /**
   * The version of the site's format for this part, a whole number from 1, so
   * the site reads only what it knows and refuses what a newer version wrote.
   */
  version: number;
  /** The part, as JSON writes it. */
  value: unknown;
}

/** What a site needs to open one of its figures again. */
export interface FigureStates {
  /**
   * What the figure is.
   * @default undefined — a picture the site cannot open again
   */
  data?: SiteState;
  /**
   * Where it stood.
   * @default undefined — it opens on the site's own view
   */
  view?: SiteState;
  /**
   * The workspace it was made in.
   * @default undefined — it opens in the reader's own workspace
   */
  preferences?: SiteState;
}

/** The state a figure carries, as it is read back. */
export interface CarriedFigureStates extends FigureStates {
  /** The site that wrote it, as the family names it, e.g. `3d`. */
  site: string;
  /**
   * The page as it stood when the figure was drawn, as its source names it.
   */
  href: string;
  /**
   * The build that wrote it, e.g. `draw.cheminfo.org 1.4.0`.
   * @default undefined — not said
   */
  generator?: string;
  /**
   * Whether the picture was changed since the state was written — redrawn in
   * another program — so the state draws something other than the picture
   * shows, and opening it would lose that change.
   */
  edited: boolean;
}

/**
 * The elements a figure's source carries its state in.
 * @param states - The state.
 * @returns The elements' markup, in the order of `STATE_PARTS`.
 * @throws {Error} When a version is not a whole number from 1.
 */
export async function stateElements(states: FigureStates): Promise<string> {
  const written = await Promise.all(
    STATE_PARTS.map(async (part) => {
      const state = states[part];
      if (state === undefined) return '';
      const { version, value } = state;
      if (!Number.isSafeInteger(version) || version < 1) {
        throw new Error(
          `The ${part} of a figure is versioned from 1, in whole numbers, not ${version}.`,
        );
      }
      const { encoding, text } = await encodeState(value);
      return `<cheminfo:${part} version="${version}" encoding="${encoding}">${text}</cheminfo:${part}>`;
    }),
  );
  return written.join('');
}

/**
 * The state a figure carries, when a site of the family wrote one. A part
 * that does not read, or would grow past `MAX_FIGURE_STATE_BYTES`, is left
 * out; a figure carrying none of the three carries no state.
 * @param svg - The figure, as an SVG document, from anywhere.
 * @param site - The site whose state is wanted; another site's is none.
 * @returns The state, or `undefined` when the figure carries none.
 */
export async function readFigureStates(
  svg: string,
  site?: string,
): Promise<CarriedFigureStates | undefined> {
  const found = findSource(svg);
  if (found === undefined) return undefined;
  const named = readSourceTag(found);
  if (
    named === undefined ||
    (site !== undefined && !isSameSite(named.site, site))
  ) {
    return undefined;
  }
  const decoded = await Promise.all(
    STATE_PARTS.map(async (part) => {
      const [element] = sourceChildren(found, part);
      return element === undefined
        ? undefined
        : decodeState(element.tag, element.text);
    }),
  );
  const states: FigureStates = {};
  for (const [index, part] of STATE_PARTS.entries()) {
    const state = decoded[index];
    if (state !== undefined) states[part] = state;
  }
  if (Object.keys(states).length === 0) return undefined;
  const digest = attribute(found.tag, 'digest');
  const now =
    digest === undefined
      ? undefined
      : await figureDigest(withoutFigureSource(svg));
  const generator = attribute(found.tag, 'generator');
  return {
    site: named.site,
    href: named.href,
    ...(generator === undefined ? {} : { generator }),
    ...states,
    edited: now !== undefined && now !== digest,
  };
}

/**
 * The three parts of a state, without what the figure says around them.
 * @param carried - The state, as a figure carries it.
 * @returns Its parts.
 */
export function statesOf(carried: FigureStates): FigureStates {
  const states: FigureStates = {};
  for (const part of STATE_PARTS) {
    const state = carried[part];
    if (state !== undefined) states[part] = state;
  }
  return states;
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

async function encodeState(
  value: unknown,
): Promise<{ encoding: string; text: string }> {
  const json = JSON.stringify(value);
  if (new TextEncoder().encode(json).length <= READABLE_STATE_BYTES) {
    return { encoding: JSON_ENCODING, text: escapeXmlText(json) };
  }
  return {
    encoding: FIGURE_STATE_ENCODING,
    text: await packFigureValue(value),
  };
}

async function decodeState(
  tag: string,
  text: string,
): Promise<SiteState | undefined> {
  const version = Number(attribute(tag, 'version'));
  if (!Number.isSafeInteger(version) || version < 1) return undefined;
  const encoding = attribute(tag, 'encoding');
  try {
    if (encoding === JSON_ENCODING) {
      return { version, value: JSON.parse(unescapeXmlText(text)) as unknown };
    }
    if (encoding === FIGURE_STATE_ENCODING) {
      return { version, value: await unpackFigureValue(text) };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function escapeXmlText(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function unescapeXmlText(text: string): string {
  return text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}
