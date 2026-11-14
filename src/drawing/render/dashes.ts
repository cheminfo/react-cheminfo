/**
 * The dashes a stroke is drawn in, in proportion to its width, so a bold
 * dashed line keeps the look of a thin one: the plain dashes are five widths
 * long with gaps of three, and the dots of a dotted line are round.
 */

import type { DashPattern, LineDash } from '../core/dashes.ts';
import { roundCoordinate } from '../core/geometry.ts';

/** How a stroke is dashed. */
export interface StrokeDash {
  /** Dash and gap lengths, in points. */
  dash: number[];
  /**
   * Whether its dashes end round, as the dots of a dotted line do.
   * @default false — square ends, the dash as long as it is written
   */
  round?: true;
}

/** Each pattern, in widths of the line: dash, gap, dash, gap… */
const PATTERNS: Readonly<Record<DashPattern, readonly number[]>> = {
  short: [2, 2],
  long: [10, 4],
  // A dash of no length with round ends is a dot as wide as the line.
  dotted: [0, 2],
  'dash-dot': [6, 2.5, 1, 2.5],
  'dash-dot-dot': [6, 2.5, 1, 2.5, 1, 2.5],
  'long-dash-dot': [11, 3, 1, 3],
};

/**
 * The plain dashes of the drawing: dashes of five widths, gaps of three.
 * @param width - The width of the line, in points.
 * @returns The dash and gap lengths, in points.
 */
export function dashPattern(width: number): number[] {
  return [roundCoordinate(width * 5), roundCoordinate(width * 3)];
}

/**
 * The dashes a line is drawn in.
 * @param dashed - Whether and how it is dashed.
 * @param width - The width of the line, in points.
 * @returns The dashes, or undefined for a solid line.
 */
export function strokeDash(
  dashed: LineDash | undefined,
  width: number,
): StrokeDash | undefined {
  if (!dashed) return undefined;
  if (dashed === true) return { dash: dashPattern(width) };
  const dash = PATTERNS[dashed].map((length) =>
    roundCoordinate(length * width),
  );
  return dashed === 'dotted' ? { dash, round: true } : { dash };
}

/**
 * A stroke given its dashes.
 * @param primitive - The stroke, changed in place.
 * @param dash - Its dashes, or undefined to leave it solid.
 * @returns The stroke.
 */
export function withDash<T extends { dash?: readonly number[]; cap?: 'round' }>(
  primitive: T,
  dash: StrokeDash | undefined,
): T {
  if (!dash) return primitive;
  primitive.dash = dash.dash;
  if (dash.round) primitive.cap = 'round';
  return primitive;
}

/**
 * The ends of a stroke's dashes, as SVG writes them: square unless they are
 * the round dots of a dotted line; a solid stroke keeps the figure's own.
 * @param primitive - The stroke.
 * @param primitive.dash - Its dashes.
 * @param primitive.cap - Its dashes' ends.
 * @returns The `stroke-linecap`, or undefined for a solid stroke.
 */
export function dashCap(primitive: {
  dash?: readonly number[];
  cap?: 'round';
}): 'butt' | 'round' | undefined {
  if (!primitive.dash) return undefined;
  return primitive.cap ?? 'butt';
}
