import type { ReactElement } from 'react';
import { useId, useMemo } from 'react';

import { rangeHistogramPath } from '../core/rangeHistogram.ts';

/** What the histogram over a range slider needs. */
export interface RangeHistogramProps {
  /** One count per bin, the bins splitting the track into equal widths. */
  counts: ArrayLike<number>;
  /** Where the kept part starts, as a fraction of the track. */
  start: number;
  /** Where it ends. */
  end: number;
}

/**
 * How the values are spread along the track, the part the handles keep drawn
 * in the brand colour. The outline is drawn twice, the second copy clipped to
 * the handles, so a drag moves one rectangle and the outline is never redrawn.
 * @param props - See {@link RangeHistogramProps}.
 * @returns The histogram, hidden from a screen reader: the values under the
 * track already say what it keeps.
 */
export function RangeHistogram(props: RangeHistogramProps): ReactElement {
  const { counts, start, end } = props;
  const clip = `range-histogram-${useId().replaceAll(/\W/g, '')}`;
  const outline = useMemo(() => rangeHistogramPath(counts), [counts]);

  return (
    <svg
      className="range-slider__histogram"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <rect x={start} y={0} width={Math.max(end - start, 0)} height={1} />
        </clipPath>
      </defs>
      <path className="range-slider__bars" d={outline} />
      <path
        className="range-slider__bars range-slider__bars--kept"
        d={outline}
        clipPath={`url(#${clip})`}
      />
    </svg>
  );
}
