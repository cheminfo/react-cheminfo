/**
 * One series drawn over a band axis, as a line or as bars from the zero line.
 *
 * It is its own module because it is the one part of a band chart that a
 * caller might reasonably want on its own — a sparkline, a preview inside a
 * list row — and because the tracking layer beside it is about the pointer
 * rather than about the data.
 */

import type { ReactElement } from 'react';

import type { ChartBand } from '../core/chartBand.ts';
import type { ChartScale } from '../core/chartScale.ts';

import type { ChartSeries } from './TrackedLineChart.tsx';

/** What {@link ChartSeriesMarks} draws. */
export interface ChartSeriesMarksProps {
  /** The series to draw. */
  item: ChartSeries;
  /** The slots it is drawn over. */
  band: ChartBand;
  /** Data to pixels, vertically. */
  y: ChartScale;
  /**
   * Which of the bar series this one is, and how many there are, so that two
   * of them share a slot side by side instead of one painting over the other.
   *
   * Lines ignore it: two lines over one slot are both readable where two bars
   * from the same baseline are not, and narrowing a line would say nothing.
   * @default { index: 0, count: 1 } — the series has the slot to itself
   */
  lane?: { index: number; count: number };
}

/**
 * One series over the band: a line as a single path, or a bar per slot growing
 * from the zero line in whichever direction its value points. The line is one
 * `d` string built in an indexed loop rather than an element per point, since
 * a spectrum is two thousand points and four panels of them as separate
 * elements is a page that will not scroll.
 * @param props - See {@link ChartSeriesMarksProps}.
 * @returns Its marks.
 */
export function ChartSeriesMarks(props: ChartSeriesMarksProps): ReactElement {
  const { item, band, y, lane = SOLE_LANE } = props;
  const slots = Math.min(band.count, item.values.length);
  const muted = item.muted === true;
  const grounded = item.kind === 'bar';
  const lanes = Math.max(1, lane.count);
  const wide = round(band.bandWidth / lanes);
  const shift = band.bandWidth * ((lane.index + 0.5) / lanes - 0.5);
  const rects: ReactElement[] = [];
  let path = '';
  let pen = 'M';
  for (let index = 0; index < slots; index++) {
    const value = item.values[index];
    if (value === undefined || !Number.isFinite(value)) {
      pen = 'M';
      continue;
    }
    const x = band.offset + band.step * (index + 0.5);
    const at = y.offset + value * y.factor;
    if (!grounded) {
      path += `${pen}${round(x)} ${round(at)}`;
      pen = 'L';
      continue;
    }
    const near = round(x + shift - band.bandWidth / lanes / 2);
    const high = round(Math.min(at, y.offset));
    const tall = round(Math.abs(at - y.offset));
    rects.push(
      <rect key={index} x={near} y={high} width={wide} height={tall} />,
    );
  }
  if (grounded) {
    return (
      <g data-series={item.id} fill={item.color} opacity={muted ? 0.55 : 1}>
        {rects}
      </g>
    );
  }
  return (
    <path
      data-series={item.id}
      d={path}
      fill="none"
      stroke={item.color}
      strokeWidth={muted ? 1 : 1.5}
      strokeDasharray={muted ? '4 3' : undefined}
    />
  );
}

/** What a series drawn on its own is told, which is that it has the slot. */
const SOLE_LANE = { index: 0, count: 1 } as const;

const round = (value: number): number => Math.round(value * 100) / 100;
