import { expect, test } from 'vitest';

import type { PlotRect } from '../../core/chartGeometry.ts';
import type { ChartPointer } from '../useChartPointer.ts';
import {
  isInsidePlot,
  nextChartPointer,
  sameReading,
} from '../useChartPointer.ts';

/** The plot of a chart 660 by 264, as `plotRect` works it out. */
const plot: PlotRect = {
  left: 60,
  top: 16,
  width: 584,
  height: 200,
  right: 644,
  bottom: 216,
};

/**
 * A reading of whatever a viewer puts under its pointer, standing in for one.
 *
 * `value` is what the crosshair reads and changes on every pixel; `feature` is
 * the thing the reading is about, and is what a viewer compares.
 */
interface Reading {
  value: number;
  feature: string | null;
}

/**
 * Whether two readings are about the same feature, as a viewer would ask.
 * @param current - What was last read.
 * @param next - What has just been read.
 * @returns Whether both are about the same thing.
 */
function sameFeature(current: Reading, next: Reading): boolean {
  return current.feature === next.feature;
}

test('two readings of one feature are the same reading, whatever the value', () => {
  expect(
    sameReading(
      { value: 1, feature: 'a' },
      { value: 2, feature: 'a' },
      sameFeature,
    ),
  ).toBe(true);
  expect(sameReading(null, null, sameFeature)).toBe(true);
});

test('a reading and no reading are never the same answer', () => {
  const reading: Reading = { value: 1, feature: 'a' };

  expect(sameReading(reading, null, sameFeature)).toBe(false);
  expect(sameReading(null, reading, sameFeature)).toBe(false);
});

test('another feature is a new answer', () => {
  expect(
    sameReading(
      { value: 1, feature: 'a' },
      { value: 1, feature: 'b' },
      sameFeature,
    ),
  ).toBe(false);
  expect(
    sameReading(
      { value: 1, feature: 'a' },
      { value: 1, feature: null },
      sameFeature,
    ),
  ).toBe(false);
});

test('a hand resting on one feature is not reported again', () => {
  const held = restingOn(300, 120, 'a');

  expect(nextChartPointer(held, restingOn(300, 120, 'a'), sameFeature)).toBe(
    held,
  );
});

test('a pointer that actually moved is a new answer', () => {
  const held = restingOn(300, 120, 'a');

  expect(
    nextChartPointer(held, restingOn(301, 120, 'a'), sameFeature),
  ).not.toBe(held);
  expect(
    nextChartPointer(held, restingOn(300, 121, 'a'), sameFeature),
  ).not.toBe(held);
});

test('the same place answering for a different feature is a new answer', () => {
  const held = restingOn(300, 120, 'a');
  const moved = restingOn(300, 120, 'b');

  expect(nextChartPointer(held, moved, sameFeature)).toBe(moved);
});

test('a pointer that is away stays away rather than being reported again', () => {
  const away: ChartPointer<Reading> = { position: null, readout: null };

  expect(
    nextChartPointer(away, { position: null, readout: null }, sameFeature),
  ).toBe(away);
  expect(
    nextChartPointer(away, restingOn(300, 120, 'a'), sameFeature),
  ).not.toBe(away);
  expect(nextChartPointer(restingOn(300, 120, 'a'), away, sameFeature)).toBe(
    away,
  );
});

test('the pointer is only followed over the data, never over an axis', () => {
  expect(isInsidePlot(plot, { x: 300, y: 120 })).toBe(true);
  expect(isInsidePlot(plot, { x: 60, y: 16 })).toBe(true);
  expect(isInsidePlot(plot, { x: 644, y: 216 })).toBe(true);
  // The left-hand labels, the x axis title, and the room kept above the data.
  expect(isInsidePlot(plot, { x: 30, y: 120 })).toBe(false);
  expect(isInsidePlot(plot, { x: 300, y: 240 })).toBe(false);
  expect(isInsidePlot(plot, { x: 300, y: 8 })).toBe(false);
});

/**
 * A pointer resting somewhere over the plot.
 * @param x - Where it is, in user units of the SVG.
 * @param y - Where it is vertically.
 * @param feature - What the reading there is about.
 * @returns What the hook would hold.
 */
function restingOn(
  x: number,
  y: number,
  feature: string,
): ChartPointer<Reading> {
  return { position: { x, y }, readout: { value: x, feature } };
}
