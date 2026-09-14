import { clamp } from '../../format/core/clamp.ts';

/** How {@link positionInRange} places a value. */
export interface PositionInRangeOptions {
  /**
   * Whether to place the value on a base-10 logarithmic scale, for a quantity
   * — an abundance, a density, a concentration — spread over so many decades
   * that a linear placement gives all but a couple of values the same colour.
   * @default false
   */
  logarithmic?: boolean;
}

/**
 * Where a value sits between two bounds.
 * @param value - The value to place.
 * @param min - The smallest value the range holds.
 * @param max - The largest value it holds.
 * @param options - See {@link PositionInRangeOptions}.
 * @returns A fraction clamped to 0..1; the middle when the range holds a single value, and 0 when any of the three numbers is not finite.
 */
export function positionInRange(
  value: number,
  min: number,
  max: number,
  options: PositionInRangeOptions = {},
): number {
  const { logarithmic = false } = options;
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return 0;
  }
  if (max === min) return 0.5;
  if (!logarithmic) return clamp((value - min) / (max - min), 0, 1);

  const floor = Math.max(min, smallestPositive(min, max));
  const span = Math.log10(max) - Math.log10(floor);
  if (span === 0) return 0.5;
  return clamp(
    (Math.log10(Math.max(value, floor)) - Math.log10(floor)) / span,
    0,
    1,
  );
}

function smallestPositive(min: number, max: number): number {
  if (min > 0) return min;
  if (max <= 0) return 1;
  return max * 1e-12;
}
