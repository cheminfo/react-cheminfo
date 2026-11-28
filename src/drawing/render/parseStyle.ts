/**
 * The style a drawing read back from a file states, kept only when every
 * length is in a range a journal could ask for and every font is one the
 * settings offer: a file cannot write arbitrary markup into the picture.
 */

import { isFiniteNumber, isRecord } from '../../values/core/values.ts';
import { CAPTION_FAMILIES, FONTS } from '../core/fonts.ts';
import { isColor } from '../core/palette.ts';

import type { DrawingStyle } from './style.ts';

/** The smallest and the largest a length of a style may be, in points. */
export interface StyleLengthRange {
  /** The smallest. */
  min: number;
  /** The largest. */
  max: number;
}

/** The range each length every drawing style states may take, in points. */
export const DRAWING_STYLE_LIMITS = {
  bondLength: { min: 4, max: 72 },
  lineWidth: { min: 0.1, max: 4 },
  captionSize: { min: 4, max: 36 },
} as const satisfies Record<string, StyleLengthRange>;

const FAMILIES: ReadonlySet<string> = new Set(FONTS.map((font) => font.family));

/**
 * A style from parsed JSON: every length the limits name, brought within its
 * range, a font the settings offer, and the ink and the background when they
 * are colours. What a site's style carries beyond these is the site's to read.
 * @param value - What the document's `style` holds.
 * @param base - The style the fields not stated keep, such as ACS 1996.
 * @param limits - The lengths read, and their ranges: a site whose style
 * carries more lengths adds them to {@link DRAWING_STYLE_LIMITS}.
 * @returns The style, or undefined when there is none or a length is missing.
 */
export function parseDrawingStyle<S extends DrawingStyle>(
  value: unknown,
  base: S,
  limits: Readonly<Record<string, StyleLengthRange>> = DRAWING_STYLE_LIMITS,
): S | undefined {
  if (!isRecord(value)) return undefined;
  const style: Record<string, unknown> = Object.fromEntries(
    Object.entries(base),
  );
  for (const [key, { min, max }] of Object.entries(limits)) {
    const length = value[key];
    if (!isFiniteNumber(length)) return undefined;
    style[key] = Math.min(max, Math.max(min, length));
  }
  if (typeof value.fontFamily === 'string' && FAMILIES.has(value.fontFamily)) {
    style.fontFamily = value.fontFamily;
  }
  if (
    typeof value.captionFamily === 'string' &&
    CAPTION_FAMILIES.has(value.captionFamily)
  ) {
    style.captionFamily = value.captionFamily;
  }
  if (isColor(value.color)) style.color = value.color;
  if (isColor(value.background)) style.background = value.background;
  return style as S;
}
