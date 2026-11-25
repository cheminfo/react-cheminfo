// tokens-ok: file — a halo is drawing ink, saved with the figure it is drawn in, not the site's chrome.
/**
 * The halo that lets a mark read on any ground: a stroke painted under a line,
 * or behind the letters of a label (`paint-order: stroke`), so a white outline
 * reads on a bright film and on a dark field alike. One rule for every mark a
 * drawing of the family writes — an annotation, an object's outline or label,
 * a figure's legend —: under a stroke the halo is dark, half the stroke wide
 * on each side; under text it is the ink the letters stand out from, a sixth
 * of their size wide; both at one opacity.
 */

import { readableInk } from '../../color/core/contrast.ts';

/** The halo's two inks and its opacity. */
export const HALO = {
  /** Under a stroke, and under light text. */
  dark: '#000000',
  /** Under dark text: a pure blue name over a dark halo would not read. */
  light: '#ffffff',
  /** Its opacity: the ground still shows through. */
  opacity: 0.6,
} as const;

/**
 * The width of the halo under a stroke: the stroke and half of it on each
 * side, at least half a pixel on each side.
 * @param width - The stroke's width.
 * @returns The halo's stroke width.
 */
export function haloStrokeWidth(width: number): number {
  return width + 2 * Math.max(0.5, width / 2);
}

/**
 * The halo behind text: the ink its letters stand out from, a sixth of their
 * size wide, at least one unit.
 * @param fill - The text's colour, `#rrggbb`.
 * @param size - Its size.
 * @returns The stroke's colour, opacity and width.
 */
export function haloText(
  fill: string,
  size: number,
): { stroke: string; strokeOpacity: number; strokeWidth: number } {
  return {
    stroke: readableInk(fill, { dark: HALO.dark, light: HALO.light }),
    strokeOpacity: HALO.opacity,
    strokeWidth: Math.max(1, size / 6),
  };
}
