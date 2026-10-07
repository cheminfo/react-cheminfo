/**
 * What a computed style says is painted, read the way a figure file needs it.
 */

/**
 * A colour, or nothing where the page paints nothing with it.
 * @param color - A computed colour, as `getComputedStyle` writes it.
 * @returns The colour, or undefined where it is transparent.
 */
export function visibleColor(color: string): string | undefined {
  const value = color.trim();
  if (value === '' || value === 'transparent') return undefined;
  if (ZERO_ALPHA_COMMAS.test(value) || ZERO_ALPHA_SLASH.test(value)) {
    return undefined;
  }
  return value;
}

/**
 * The dashes a CSS line style is drawn with.
 * @param style - The computed `border-*-style` or `outline-style`.
 * @param width - The line's width, in pixels.
 * @returns The dashes and gaps in pixels — empty for a solid line — or
 *   undefined where no line is drawn. `auto` is a focus ring, which is the
 *   state of the pointer rather than a part of the figure.
 */
export function lineDash(
  style: string,
  width: number,
): readonly number[] | undefined {
  if (!(width > 0)) return undefined;
  switch (style) {
    case 'none':
    case 'hidden':
    case 'auto':
    case '':
      return undefined;
    case 'dashed':
      return [width * 3, width * 3];
    case 'dotted':
      return [width, width];
    default:
      return [];
  }
}

/**
 * A corner radius in pixels.
 * @param radius - The computed `border-*-radius`, in pixels or as a share.
 * @param width - The box's width, which a share is taken of.
 * @param height - Its height.
 * @returns The radius, in pixels.
 */
export function cornerRadius(
  radius: string,
  width: number,
  height: number,
): number {
  const value = Number.parseFloat(radius);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (radius.trim().endsWith('%')) {
    return (Math.min(width, height) * value) / 100;
  }
  return value;
}

/** `rgba(r, g, b, 0)`, which is what a transparent ground computes to. */
const ZERO_ALPHA_COMMAS = /^rgba\((?:[^,]+,){3}\s*0(?:\.0*)?\)$/;

/** `rgb(r g b / 0)` and `color(srgb r g b / 0)`. */
const ZERO_ALPHA_SLASH = /\/\s*0(?:\.0*)?%?\)$/;
