/** Measurements laid out along a number line — a spectrum, a chromatogram. */
export interface ContinuousVariableAxis {
  /** Discriminant. */
  kind: 'continuous';
  /** One value per measurement, in column order, e.g. wavenumbers. */
  values: readonly number[];
  /** What the axis measures, e.g. `Wavenumber`. */
  label: string;
  /**
   * Written after a value, e.g. `cm⁻¹`.
   * @default '' — no unit is written
   */
  unit?: string;
  /**
   * Which way the axis runs. `descending` puts high values on the left, the
   * way an infrared or an NMR spectrum is read.
   * @default 'ascending'
   */
  direction?: 'ascending' | 'descending';
}

/**
 * Measurements picked out of a spectrum rather than sampled across one — the
 * m/z of a peak list, the shifts of an NMR signal list, a band table.
 *
 * It carries the same fields as a continuous axis and is a separate kind
 * because the two are drawn differently and the difference is not one the
 * panel can see in the numbers. A sampled spectrum sits on a grid, so its
 * measurements can be laid out in even slots and joined with a line without
 * saying anything untrue. A peak list does not: the gap between two peaks is a
 * measurement in its own right, laying them out evenly would draw an empty
 * stretch of a spectrum as though it were crowded, and joining them with a
 * line would claim a signal between two masses that were measured apart.
 * Peaks are drawn as sticks standing where they were measured.
 */
export interface PeaksVariableAxis {
  /** Discriminant. */
  kind: 'peaks';
  /** Where each measurement sits, in column order, e.g. the m/z of each peak. */
  values: readonly number[];
  /** What the axis measures, e.g. `m/z`. */
  label: string;
  /**
   * Written after a value, e.g. `Da`.
   * @default '' — no unit is written
   */
  unit?: string;
}

/** Measurements that are a list of names — the columns of a table. */
export interface NamedVariableAxis {
  /** Discriminant. */
  kind: 'named';
  /** One name per measurement, in column order, e.g. `Petal length`. */
  names: readonly string[];
  /**
   * What the names are, for the axis caption.
   * @default 'Measurement'
   */
  label?: string;
}

/**
 * How the original measurements are laid out, which decides how they are drawn.
 *
 * The caller states it; the panel never guesses from the data. A continuous
 * axis is drawn as a line across even slots, a named one as bars from the zero
 * line, and a peak list as sticks standing at the values themselves on a real
 * number line.
 */
export type VariableAxis =
  ContinuousVariableAxis | NamedVariableAxis | PeaksVariableAxis;

/**
 * How many measurements an axis carries.
 * @param axis - The axis.
 * @returns The count.
 */
export function variableCount(axis: VariableAxis): number {
  return axis.kind === 'named' ? axis.names.length : axis.values.length;
}

/**
 * Where each measurement sits, for an axis that is a number line.
 * @param axis - The axis.
 * @returns The positions, or `null` for a named axis, which has none.
 */
export function variablePositions(
  axis: VariableAxis,
): readonly number[] | null {
  return axis.kind === 'named' ? null : axis.values;
}

/**
 * What one measurement is called, written out.
 * @param axis - The axis.
 * @param index - Which measurement, from 0.
 * @param decimals - Decimals the value is rounded to, from `variableDecimals`,
 * for a label written under a tick.
 * @default undefined — the number is written as it was handed in, which is
 * what a readout naming one slot wants
 * @returns The name, or the value with its unit — `1650 cm⁻¹`. An index
 * outside the axis gives an empty string.
 */
export function variableLabel(
  axis: VariableAxis,
  index: number,
  decimals?: number,
): string {
  if (!Number.isInteger(index) || index < 0) return '';
  if (axis.kind === 'named') return axis.names[index] ?? '';

  const value = axis.values[index];
  if (value === undefined) return '';
  // Asked for in full, a number is written as it was handed in: rounding a
  // wavenumber to a tidier one would name a slot the reader cannot find in
  // their own file.
  const written =
    decimals === undefined ? String(value) : String(rounded(value, decimals));
  const unit = axis.unit ?? '';
  return unit === '' ? written : `${written} ${unit}`;
}

/**
 * How many decimals the axis writes its own values with.
 *
 * About a hundred steps across the span the axis covers, which is finer than
 * the dozen-odd ticks a chart labels and coarse enough to drop what a
 * resampling left behind: a spectrum landed on its own grid carries values
 * like 878.9834, where every digit past the second says something about the
 * grid rather than about the measurement, so a tick reads `879 cm⁻¹`. A named
 * axis has no values to write and gets none.
 * @param axis - The axis.
 * @returns The decimals, from 0 to 6.
 */
export function variableDecimals(axis: VariableAxis): number {
  if (axis.kind === 'named') return 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of axis.values) {
    if (!Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return MOST_DECIMALS;
  const decimals = AXIS_DIGITS - Math.ceil(Math.log10(span));
  return Math.min(MOST_DECIMALS, Math.max(0, decimals));
}

function rounded(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Digits kept above the decimal point when the axis writes a value. */
const AXIS_DIGITS = 2;

/** Decimals an axis is never written past, however narrow its span. */
const MOST_DECIMALS = 6;
