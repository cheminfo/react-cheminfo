import { expect, test } from 'vitest';

import { peakLabelLines } from '../peakLabelLines.ts';

test('a peak always carries its m/z over its intensity', () => {
  expect(peakLabelLines({ x: 325.1129, y: 42.5, charge: 0 })).toStrictEqual([
    { kind: 'mz', text: '325.1129' },
    { kind: 'intensity', text: '42.50' },
  ]);
});

test('a nominal peak table is written as whole numbers', () => {
  expect(
    peakLabelLines({ x: 163, y: 100, charge: 0 }, { mzDecimals: 0 }),
  ).toStrictEqual([
    { kind: 'mz', text: '163' },
    { kind: 'intensity', text: '100' },
  ]);
});

test('a charge is written only when it was established and is asked for', () => {
  const peak = { x: 500.25, y: 80, charge: 2 };

  expect(peakLabelLines(peak, { showCharges: true })[0]).toStrictEqual({
    kind: 'charge',
    text: 'z = 2',
  });
  expect(peakLabelLines(peak)).toHaveLength(2);
  expect(
    peakLabelLines({ ...peak, charge: 0 }, { showCharges: true }),
  ).toHaveLength(2);
});

test('a negative charge keeps its sign', () => {
  expect(
    peakLabelLines({ x: 500.25, y: 80, charge: -1 }, { showCharges: true })[0],
  ).toStrictEqual({ kind: 'charge', text: 'z = -1' });
});

test('the name of what explains a peak is the line farthest from the stick', () => {
  const lines = peakLabelLines(
    { x: 325.1129, y: 42.5, charge: 2 },
    { showCharges: true, annotationLabel: 'B@4.4' },
  );

  // Farthest first: the name ends up directly under the picture pinned above
  // the stack, and the intensity ends up on the stick it was measured from.
  expect(lines).toStrictEqual([
    { kind: 'annotation', text: 'B@4.4' },
    { kind: 'charge', text: 'z = 2' },
    { kind: 'mz', text: '325.1129' },
    { kind: 'intensity', text: '42.50' },
  ]);
});

test('an empty name is no name at all', () => {
  expect(
    peakLabelLines({ x: 325, y: 42, charge: 0 }, { annotationLabel: '' }),
  ).toHaveLength(2);
});

test('a spectrum kept in counts is written as a percentage of the pane', () => {
  // 698000 counts on a chart whose tallest peak is a million: the stick is
  // drawn exactly where it was, and the number over it says 69.80.
  expect(
    peakLabelLines(
      { x: 381.1807, y: 698000, charge: 0 },
      { intensityScale: 100 / 1e6 },
    ),
  ).toStrictEqual([
    { kind: 'mz', text: '381.1807' },
    { kind: 'intensity', text: '69.80' },
  ]);
});
