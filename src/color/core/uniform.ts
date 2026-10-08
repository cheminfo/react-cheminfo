import { TOKEN } from '../../tokens/core/familyTokens.ts';

import { readableInk } from './contrast.ts';
import { normalizeHexColor } from './hex.ts';
import type { Swatch } from './interpolate.ts';

/**
 * What a colour-scale picker offering one colour writes for it, and a link
 * carries: every value the same colour, so the figure needs no key. Followed by
 * `-` and a hex colour, e.g. `uniform-1c6e42`, it names that colour.
 */
export const UNIFORM_COLOR_SCALE_ID = 'uniform';

/**
 * The one colour of a uniform scale that names none: the family's border grey
 * rather than white, so a cell still stands out from a white page and from the
 * white ground of a saved figure.
 */
export const UNIFORM_SWATCH: Swatch = {
  background: TOKEN.border,
  foreground: TOKEN.text,
};

const PREFIX = `${UNIFORM_COLOR_SCALE_ID}-`;

/**
 * Whether a scale text asks for one colour.
 * @param text - A scale id or a custom scale, as a link carries it.
 * @returns `true` for {@link UNIFORM_COLOR_SCALE_ID}, with or without a colour.
 */
export function isUniformColorScale(text: string | undefined): boolean {
  const wanted = (text ?? '').trim().toLowerCase();
  return wanted === UNIFORM_COLOR_SCALE_ID || wanted.startsWith(PREFIX);
}

/**
 * The colour a uniform scale text names, and the ink to write on it.
 *
 * A colour with a typo in it falls back to the grey rather than failing, so a
 * link written by hand still opens the figure.
 * @param text - A scale text, e.g. `uniform` or `uniform-1c6e42`.
 * @returns The swatch it names, or {@link UNIFORM_SWATCH}.
 */
export function uniformSwatch(text: string | undefined): Swatch {
  const color = uniformColor(text);
  if (color === null) return UNIFORM_SWATCH;
  return { background: color, foreground: readableInk(color) };
}

/**
 * Write one colour as the scale text a link carries; the `#` is dropped, since
 * a query string is cut in two at the first one.
 * @param color - The colour, as `#rgb` or `#rrggbb`.
 * @returns E.g. `uniform-1c6e42`, or {@link UNIFORM_COLOR_SCALE_ID} when the colour is not a hex colour.
 */
export function formatUniformColorScale(color: string): string {
  const normalized = normalizeHexColor(color);
  return normalized === null
    ? UNIFORM_COLOR_SCALE_ID
    : `${PREFIX}${normalized.slice(1)}`;
}

function uniformColor(text: string | undefined): string | null {
  const wanted = (text ?? '').trim().toLowerCase();
  if (!wanted.startsWith(PREFIX)) return null;
  return normalizeHexColor(`#${wanted.slice(PREFIX.length)}`);
}
