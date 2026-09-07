import type {
  ColorInterpolation,
  ColorScale,
  ColorStop,
} from './interpolate.ts';
import type { NamedColorScale } from './scales.ts';
import {
  COLOR_SCALES,
  DEFAULT_COLOR_SCALE_ID,
  colorScaleById,
} from './scales.ts';

/** How many anchors a link may spell out. */
export const MAXIMUM_CUSTOM_STOPS = 12;

const HEX_DIGITS = /^(?:[\da-f]{3}|[\da-f]{6})$/;
const POSITION_DECIMALS = 3;
const INTERPOLATIONS: readonly ColorInterpolation[] = [
  'rgb',
  'hsv',
  'hsv-long',
];

/** The scale a piece of text names, whether it named one of ours or spelled out its own. */
export interface ResolvedColorScale {
  /** The registry entry it named, or `null` when the text spelled out its own scale. */
  id: string | null;
  /** What to call it. */
  label: string;
  /** The ramp itself. */
  scale: ColorScale;
}

/**
 * The scale a link, a stored preference or a picker asks for.
 *
 * Nothing here throws and nothing is rejected outright: a scale renamed since
 * the link was written, a colour with a typo in it, a position out of range —
 * each falls back to the scale the site reads by default, because a link
 * handed out in a course two years ago must still open the tool.
 * @param text - A scale id, e.g. `plasma`, or a custom scale as {@link formatColorScale} writes it, e.g. `hsv-long,0-0000ff,1-ff0000`.
 * @param fallbackId - The scale to read when the text names none.
 * @returns The scale, and the id when it was one of ours.
 */
export function resolveColorScale(
  text: string | undefined,
  fallbackId: string = DEFAULT_COLOR_SCALE_ID,
): ResolvedColorScale {
  const wanted = (text ?? '').trim().toLowerCase();
  const named = colorScaleById(wanted);
  if (named !== undefined) return fromNamed(named);

  const custom = parseColorScale(wanted);
  if (custom !== null) return { id: null, label: 'Custom', scale: custom };

  const fallback = colorScaleById(fallbackId) ?? COLOR_SCALES[0];
  if (fallback === undefined) {
    throw new Error('no colour scale is registered');
  }
  return fromNamed(fallback);
}

/**
 * Read a custom scale out of the text a link carries.
 *
 * Everything in it is comma-separated, and a browser escapes none of it, so
 * the link a teacher hands out stays the one they can read and retype.
 * @param text - The path, then the anchors, e.g. `hsv-long,0-0000ff,1-ff0000`. The path may be left out, and is then `rgb`.
 * @returns The scale, or `null` when the text does not spell out at least two usable anchors.
 */
export function parseColorScale(text: string): ColorScale | null {
  const pieces = text.split(',');
  const first = (pieces[0] ?? '').trim().toLowerCase();
  const named = isInterpolation(first);

  const stops: ColorStop[] = [];
  for (const piece of named ? pieces.slice(1) : pieces) {
    const stop = parseStop(piece);
    if (stop !== null) stops.push(stop);
  }
  if (stops.length < 2) return null;

  stops.sort((one, other) => one.position - other.position);
  return {
    stops: stops.slice(0, MAXIMUM_CUSTOM_STOPS),
    interpolation: named ? first : 'rgb',
  };
}

/**
 * Write a custom scale as the text a link carries.
 *
 * The `#` of each colour is dropped: a query string that carries one is cut in
 * two at the first of them, and everything after it never reaches the site.
 * @param scale - The scale to write.
 * @returns Its text, e.g. `hsv-long,0-0000ff,1-ff0000`.
 */
export function formatColorScale(scale: ColorScale): string {
  const pieces: string[] = [scale.interpolation];
  for (const stop of scale.stops) {
    const color = stop.color.trim().toLowerCase().replace('#', '');
    if (!HEX_DIGITS.test(color)) continue;
    pieces.push(`${formatPosition(stop.position)}-${color}`);
  }
  return pieces.join(',');
}

function fromNamed(named: NamedColorScale): ResolvedColorScale {
  return { id: named.id, label: named.label, scale: named.scale };
}

function parseStop(piece: string): ColorStop | null {
  const text = piece.trim().toLowerCase();
  const separator = text.lastIndexOf('-');
  if (separator <= 0) return null;
  const position = Number.parseFloat(text.slice(0, separator));
  if (!Number.isFinite(position)) return null;
  const color = text.slice(separator + 1).replace('#', '');
  if (!HEX_DIGITS.test(color)) return null;
  return { position: Math.min(1, Math.max(0, position)), color: `#${color}` };
}

function isInterpolation(value: string): value is ColorInterpolation {
  for (const interpolation of INTERPOLATIONS) {
    if (interpolation === value) return true;
  }
  return false;
}

function formatPosition(position: number): string {
  const inside = Math.min(1, Math.max(0, position));
  if (!Number.isFinite(inside)) return '0';
  return String(Number(inside.toFixed(POSITION_DECIMALS)));
}
