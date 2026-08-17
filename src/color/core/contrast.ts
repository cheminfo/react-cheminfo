import { parseHexColor } from './hex.ts';

const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
const LINEAR_THRESHOLD = 0.039_28;

/** The ink written on a light background. */
const DARK_INK = '#182026';
/** The ink written on a dark background. */
const LIGHT_INK = '#ffffff';

/** Which two inks {@link readableInk} chooses between. */
export interface ReadableInkOptions {
  /**
   * The ink for a light background.
   * @default '#182026'
   */
  dark?: string;
  /**
   * The ink for a dark background.
   * @default '#ffffff'
   */
  light?: string;
}

/**
 * The relative luminance of a colour, as WCAG 2 defines it.
 * @param color - A `#rgb` or `#rrggbb` colour.
 * @returns Its luminance, from 0 for black to 1 for white.
 * @throws {Error} When the string is not a hex colour.
 */
export function relativeLuminance(color: string): number {
  const { red, green, blue } = parseHexColor(color);
  return (
    RED_WEIGHT * linearize(red) +
    GREEN_WEIGHT * linearize(green) +
    BLUE_WEIGHT * linearize(blue)
  );
}

/**
 * The WCAG contrast ratio between two colours, whichever way round they come.
 *
 * Body text needs 4.5, large text and interface parts need 3.
 * @param first - A `#rgb` or `#rrggbb` colour.
 * @param second - The colour it is read against.
 * @returns A ratio from 1 for two identical colours to 21 for black on white.
 * @throws {Error} When either string is not a hex colour.
 */
export function contrastRatio(first: string, second: string): number {
  const one = relativeLuminance(first);
  const other = relativeLuminance(second);
  const lighter = Math.max(one, other);
  const darker = Math.min(one, other);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The ink that stays readable on a background.
 *
 * The two candidates are compared by contrast ratio rather than by a lightness
 * threshold, so the choice is the one WCAG would make and a mid-tone
 * background gets the ink it actually reads better against.
 * @param background - The `#rgb` or `#rrggbb` colour written on.
 * @param options - See {@link ReadableInkOptions}.
 * @returns Whichever of the two inks reaches the higher contrast.
 * @throws {Error} When any of the colours is not a hex colour.
 */
export function readableInk(
  background: string,
  options: ReadableInkOptions = {},
): string {
  const { dark = DARK_INK, light = LIGHT_INK } = options;
  return contrastRatio(background, dark) >= contrastRatio(background, light)
    ? dark
    : light;
}

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= LINEAR_THRESHOLD
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}
