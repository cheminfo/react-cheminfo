/**
 * The colours a drawing is coloured with: the eight of Okabe and Ito, which
 * stay apart for every common colour vision and in a greyscale print, and
 * any other with its opacity.
 *
 * A colour is written `#rrggbb`, or `#rrggbbaa` with its alpha.
 */

/** A colour of the palette, with the name a menu gives it. */
interface PaletteColor {
  /** Its name. */
  name: string;
  /** Its value. */
  value: string;
}

/** Okabe–Ito (2008): black first, the ink of every structure. */
export const PALETTE: readonly PaletteColor[] = [
  // tokens-ok: the colours of a figure, not of the site.
  { name: 'Black', value: '#000000' },
  { name: 'Orange', value: '#e69f00' },
  { name: 'Sky blue', value: '#56b4e9' },
  { name: 'Bluish green', value: '#009e73' },
  { name: 'Yellow', value: '#f0e442' },
  { name: 'Blue', value: '#0072b2' },
  { name: 'Vermilion', value: '#d55e00' },
  { name: 'Reddish purple', value: '#cc79a7' },
];

/**
 * Whether a text is a colour a drawing can carry.
 * @param value - Any text.
 * @returns True for `#rrggbb` or `#rrggbbaa`.
 */
export function isColor(value: unknown): value is string {
  return (
    typeof value === 'string' && /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value)
  );
}

/**
 * A colour split into what SVG writes: the hex colour and its opacity.
 * @param color - `#rrggbb` or `#rrggbbaa`.
 * @returns The `#rrggbb` part and the opacity between 0 and 1.
 */
export function splitColor(color: string): { hex: string; opacity: number } {
  const hex = color.slice(0, 7).toLowerCase();
  if (color.length !== 9) return { hex, opacity: 1 };
  const alpha = Number.parseInt(color.slice(7, 9), 16) / 255;
  return { hex, opacity: Math.round(alpha * 100) / 100 };
}

/**
 * A colour from its parts.
 * @param hex - The `#rrggbb` part.
 * @param opacity - The opacity, from 0 to 1.
 * @returns `#rrggbb` when opaque, `#rrggbbaa` otherwise.
 */
export function joinColor(hex: string, opacity: number): string {
  const base = hex.slice(0, 7).toLowerCase();
  if (opacity >= 1) return base;
  const alpha = Math.round(Math.max(0, opacity) * 255);
  return `${base}${alpha.toString(16).padStart(2, '0')}`;
}

/**
 * The colour a fill first blends into: the fill in shadow, half as bright,
 * or white for a fill already too dark to shade.
 * @param fill - The fill, `#rrggbb` or `#rrggbbaa`.
 * @returns The colour, with the fill's opacity.
 */
export function shadeOf(fill: string): string {
  const { hex, opacity } = splitColor(fill);
  const channels = [1, 3, 5].map((start) =>
    Number.parseInt(hex.slice(start, start + 2), 16),
  );
  const brightest = Math.max(...channels);
  if (brightest < 64) return joinColor('#ffffff', opacity);
  const shaded = channels
    .map((channel) =>
      Math.round(channel / 2)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
  return joinColor(`#${shaded}`, opacity);
}
