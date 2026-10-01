/**
 * The ends of a logarithmic axis, and the values it is graduated at.
 *
 * Both have to be stated rather than left to the charting library, and for two
 * separate reasons.
 *
 * The ends, because a library that finds them itself may not look at every
 * value. nivo is the measured case: it sorts and takes a true minimum and
 * maximum only for a linear axis, and on a log or symmetric-log one `'auto'`
 * resolves to the first value the data carries and the last — so the domain
 * comes out in plotting order, upside down whenever the first point outweighs
 * the last, and cutting off everything past the last point drawn.
 *
 * The graduations, because d3 rules a symmetric-log axis at evenly *spaced*
 * values while placing them logarithmically, so the top of a wide axis collects
 * every graduation it has into one unreadable line. Ruling it by decade spreads
 * them evenly, which is also how such a quantity is read.
 */

/** What {@link logAxisBounds} answers. */
export interface LogAxisBounds {
  /** The low end of the axis. */
  min: number;
  /** The high end. */
  max: number;
  /**
   * The values to rule it at, or `undefined` for an axis spanning too few
   * decades to be worth ruling by them — there the library's own linear
   * graduations read better, and there is no pile-up to undo.
   */
  tickValues?: number[];
}

/** What {@link logAxisBounds} needs beyond the values. */
export interface LogAxisBoundsOptions {
  /**
   * Width of the linear region at the bottom of a symmetric-log axis — d3's
   * `constant`. Everything smaller than it is placed almost on the zero line,
   * so no graduation is written below it; a graduation there would land on top
   * of the one before it, which is the pile-up this exists to prevent.
   *
   * Pass `0` for a true logarithmic axis, which has no such region — and which
   * cannot place a zero or a negative at all, so those values are then left out
   * of the ends rather than dragging them to nothing.
   * @default 1
   */
  constant?: number;
  /**
   * Whether the ends are rounded outwards to whole powers of ten. An axis that
   * ends on its own extreme values reads as though those were round numbers;
   * one that ends on decades says what it is. Worth it on a true logarithmic
   * axis, where every graduation is a decade anyway.
   * @default false — the ends are the data's own
   */
  snapToDecades?: boolean;
  /**
   * How many decades the axis may span at most, counted down from its top. A
   * quantity that reaches zero asymptotically has no meaningful bottom, and an
   * axis given one spends most of its height on values nobody is reading.
   * Only consulted with `snapToDecades`.
   * @default Infinity — the axis spans whatever the data does
   */
  maxDecades?: number;
  /**
   * How many graduations the axis may carry. More than this is a smear however
   * they are spread, so the decades are stepped over rather than written out.
   * @default 10
   */
  mostTicks?: number;
}

/** Under this many decades the library's own graduations read better. */
const RULE_PAST_DECADES = 3;

/**
 * Where a logarithmic axis starts and ends, and where it is graduated.
 * @param values - Every value plotted on the axis. Anything not finite is
 *   ignored, so a sheet's gaps need not be filtered out first.
 * @param options - See {@link LogAxisBoundsOptions}.
 * @returns The ends and the graduations, or `null` when no value can be drawn
 *   and the caller should leave the axis to its library.
 */
export function logAxisBounds(
  values: Iterable<number>,
  options: LogAxisBoundsOptions = {},
): LogAxisBounds | null {
  const { constant = 1, snapToDecades = false } = options;
  const { maxDecades = Infinity, mostTicks = 10 } = options;
  // A true logarithmic axis has no room for a zero or a negative, so they are
  // not what its bottom end is taken from.
  const positiveOnly = constant === 0;

  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    if (positiveOnly && value <= 0) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min > max) return null;

  if (snapToDecades) {
    const top = Math.ceil(Math.log10(Math.abs(max) || 1));
    const bottom = Math.max(
      Math.floor(Math.log10(Math.abs(min) || 1)),
      top - maxDecades,
    );
    return withTicks(decade(bottom), decade(top), constant, mostTicks);
  }

  // A lone value, or a column of identical ones, spans nothing: reach to the
  // origin so it is read against a zero rather than filling the axis.
  if (min === max) {
    if (min === 0) return { min: -1, max: 1 };
    return { min: Math.min(min, 0), max: Math.max(max, 0) };
  }

  return withTicks(min, max, constant, mostTicks);
}

/**
 * The ends, with the graduations when they are worth writing.
 * @param min
 * @param max
 * @param constant
 * @param mostTicks
 */
function withTicks(
  min: number,
  max: number,
  constant: number,
  mostTicks: number,
): LogAxisBounds {
  const ticks = decadesBetween(min, max, constant, mostTicks);
  return ticks === undefined ? { min, max } : { min, max, tickValues: ticks };
}

/**
 * Zero, and the powers of ten the axis both reaches and can separate.
 * @param min - The low end of the axis.
 * @param max - Its high end.
 * @param constant - Width of the linear region; see the options.
 * @param mostTicks - How many graduations the axis may carry.
 * @returns The values to rule it at, or nothing to leave it to the library.
 */
function decadesBetween(
  min: number,
  max: number,
  constant: number,
  mostTicks: number,
): number[] | undefined {
  const largest = Math.max(Math.abs(min), Math.abs(max));
  if (largest === 0) return undefined;

  // Below the linear region every decade lands on the same pixel, so the axis
  // is ruled from there up rather than from its smallest value.
  const floor = constant > 0 ? Math.log10(constant) : smallestDecade(min, max);
  const bottom = Math.ceil(floor);
  const top = Math.floor(Math.log10(largest));
  // Under a few decades the library's own graduations read better — but only
  // where it has linear ones to offer. On a true logarithmic axis every
  // graduation is a decade, so a short one is still ruled by decade.
  if (constant > 0 && top - bottom + 1 < RULE_PAST_DECADES) return undefined;

  const step = Math.ceil((top - bottom + 1) / mostTicks);
  const ticks = min <= 0 && max >= 0 ? [0] : [];
  for (let power = bottom; power <= top; power += step) {
    const tick = decade(power);
    if (tick >= min && tick <= max) ticks.push(tick);
  }
  if (constant === 0) return ticks;
  return ticks.length < RULE_PAST_DECADES ? undefined : ticks;
}

/**
 * A whole power of ten.
 * @param power - The exponent, a whole number.
 * @returns Ten to that power, the same bits on every engine.
 */
function decade(power: number): number {
  // Read as a decimal rather than computed: `10 ** power` goes through pow,
  // which is not bit-exact across V8 versions — node 22 answers
  // 0.00009999999999999999 for -4 and 1.0000000000000001e-20 for -20 — while a
  // decimal literal is the correctly-rounded double everywhere.
  return Number(`1e${power}`);
}

/**
 * The decade of the smaller end, for an axis with no linear region.
 * @param min - The low end of the axis.
 * @param max - Its high end.
 * @returns The base-ten logarithm of the smaller end that is not zero.
 */
function smallestDecade(min: number, max: number): number {
  const ends = [Math.abs(min), Math.abs(max)].filter((end) => end > 0);
  return Math.log10(Math.min(...ends));
}
