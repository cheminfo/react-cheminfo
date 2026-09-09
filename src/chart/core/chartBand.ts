const DEFAULT_PADDING = 0.2;
const MAXIMUM_PADDING = 0.9;

/** Evenly spaced slots for a categorical axis, held as four numbers. */
export interface ChartBand {
  /** The pixel the first slot starts at. */
  readonly offset: number;
  /** Pixels from one slot's start to the next. */
  readonly step: number;
  /** How wide a bar may be drawn: `step` less the gap. */
  readonly bandWidth: number;
  /** How many slots there are. */
  readonly count: number;
}

/** How a band scale spaces its slots. */
export interface ChartBandOptions {
  /**
   * Share of a slot left empty between neighbours, held between 0 and 0.9.
   * @default 0.2
   */
  padding?: number;
}

/**
 * `count` slots laid across `rangeMin`..`rangeMax`.
 * @param count - How many categories the axis carries.
 * @param rangeMin - The pixel the axis starts at.
 * @param rangeMax - The pixel it ends at.
 * @param options - See {@link ChartBandOptions}.
 * @returns The scale. A count of zero gives a `step` of zero, which every
 * reader below treats as an empty axis rather than dividing by it.
 */
export function chartBand(
  count: number,
  rangeMin: number,
  rangeMax: number,
  options: ChartBandOptions = {},
): ChartBand {
  const { padding = DEFAULT_PADDING } = options;
  const slots = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const start = Number.isFinite(rangeMin) ? rangeMin : 0;
  const reach = Number.isFinite(rangeMax) ? rangeMax - start : 0;
  if (slots === 0 || reach === 0) {
    return { offset: start, step: 0, bandWidth: 0, count: slots };
  }
  const step = reach / slots;
  const gap = Number.isFinite(padding)
    ? Math.min(MAXIMUM_PADDING, Math.max(0, padding))
    : DEFAULT_PADDING;
  return {
    offset: start,
    step,
    bandWidth: Math.abs(step) * (1 - gap),
    count: slots,
  };
}

/**
 * The middle of one slot, which is where a point, a bar and a tick all sit.
 * @param band - The scale.
 * @param index - Which slot, from 0.
 * @returns The pixel.
 */
export function chartBandCenter(band: ChartBand, index: number): number {
  return band.offset + band.step * (index + 0.5);
}

/**
 * Which slot a pixel is nearest.
 *
 * This is the whole of the tracking hit test on a categorical axis: no search,
 * no allocation, one division.
 * @param band - The scale.
 * @param pixel - The pointer's position along the axis.
 * @returns An index held inside `0..count - 1`, or `-1` when the axis is empty.
 */
export function chartBandIndexAt(band: ChartBand, pixel: number): number {
  if (band.count <= 0 || band.step === 0 || !Number.isFinite(pixel)) return -1;
  const slot = Math.floor((pixel - band.offset) / band.step);
  return Math.min(band.count - 1, Math.max(0, slot));
}
