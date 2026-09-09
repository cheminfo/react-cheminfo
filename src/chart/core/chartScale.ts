/**
 * A data-to-pixel mapping, held as the two numbers a multiply-add needs.
 *
 * Deliberately not a callable: a chart converts one value per point per axis,
 * so a closure would be one non-inlinable call per mark. The two fields are
 * built once per axis per render and the inner loop writes the arithmetic out
 * as `offset + value * factor`.
 */
export interface ChartScale {
  /** The pixel the data value `0` lands on. */
  readonly offset: number;
  /** Pixels per unit of data. Negative for a y axis, which grows upward. */
  readonly factor: number;
}

/**
 * The mapping that puts `domainMin` at `rangeMin` and `domainMax` at `rangeMax`.
 *
 * For a y axis pass the plot's bottom as `rangeMin` and its top as `rangeMax`,
 * which is what makes `factor` negative and what makes an ellipse projected
 * through it come out the right way up with no separate flip.
 * @param domainMin - The data value at the low end of the range.
 * @param domainMax - The data value at the high end.
 * @param rangeMin - The pixel `domainMin` maps to.
 * @param rangeMax - The pixel `domainMax` maps to.
 * @returns The mapping. A zero-width or non-finite domain gives a `factor` of
 * zero, which pins every value to the middle of the range so that a constant
 * column still draws instead of vanishing.
 */
export function chartScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): ChartScale {
  const span = domainMax - domainMin;
  const reach = rangeMax - rangeMin;
  if (span === 0 || !Number.isFinite(span) || !Number.isFinite(reach)) {
    const middle = (rangeMin + rangeMax) / 2;
    return { offset: Number.isFinite(middle) ? middle : 0, factor: 0 };
  }
  const factor = reach / span;
  return { offset: rangeMin - domainMin * factor, factor };
}

/**
 * Where one data value falls, in pixels.
 *
 * For a single conversion — a tick, a pointer, a group's mean. Inside a loop
 * over points, write the multiply-add directly.
 * @param scale - The mapping.
 * @param value - The data value.
 * @returns The pixel.
 */
export function chartPixel(scale: ChartScale, value: number): number {
  if (scale.factor === 0) return scale.offset;
  return scale.offset + value * scale.factor;
}

/**
 * What data value a pixel stands for — the pointer's direction.
 * @param scale - The mapping.
 * @param pixel - The pixel.
 * @returns The data value, or `offset` when the scale is flat. Zero comes
 * back unsigned, so a readout at the origin of an inverted axis never reads
 * `-0`.
 */
export function chartValue(scale: ChartScale, pixel: number): number {
  if (scale.factor === 0) return scale.offset;
  const value = (pixel - scale.offset) / scale.factor;
  return value === 0 ? 0 : value;
}
