/**
 * How a line of the drawing is dashed: solid, in the plain dashes `true` has
 * always stood for, or in one of a few named patterns. A shape, a line and an
 * arrow are dashed the same way.
 */

/** A dash pattern other than the plain dashes. */
export type DashPattern =
  'short' | 'long' | 'dotted' | 'dash-dot' | 'dash-dot-dot' | 'long-dash-dot';

/**
 * Whether and how a line is dashed: false for a solid line, true for plain
 * dashes, or the name of another pattern.
 */
export type LineDash = boolean | DashPattern;

/** Every pattern a line may take, solid first, in the order a menu lists them. */
export const LINE_DASHES: ReadonlyArray<{ value: LineDash; name: string }> = [
  { value: false, name: 'Solid' },
  { value: true, name: 'Dashed' },
  { value: 'short', name: 'Short dashes' },
  { value: 'long', name: 'Long dashes' },
  { value: 'dotted', name: 'Dotted' },
  { value: 'dash-dot', name: 'Dash, dot' },
  { value: 'dash-dot-dot', name: 'Dash, dot, dot' },
  { value: 'long-dash-dot', name: 'Long dash, dot' },
];

const PATTERNS: ReadonlySet<unknown> = new Set(
  LINE_DASHES.map((dash) => dash.value).filter(
    (value) => typeof value === 'string',
  ),
);

/**
 * Whether a value states how a line is dashed.
 * @param value - Any value, as a file holds it.
 * @returns True for a boolean or the name of a pattern.
 */
export function isLineDash(value: unknown): value is LineDash {
  return typeof value === 'boolean' || PATTERNS.has(value);
}
