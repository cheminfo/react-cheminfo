import { expect, test } from 'vitest';

import { PEAK_LABEL } from '../../../chart/core/chartTheme.ts';
import { labelStackBaselines } from '../../../chart/core/labelStack.ts';
import { peakLabelLines } from '../peakLabelLines.ts';

import { peakFixture } from './spectrumFixture.ts';

const carbon = peakFixture('a', 284.8, 12345);

test('a stack is the energy alone unless it is asked for more', () => {
  expect(peakLabelLines(carbon)).toStrictEqual([
    { kind: 'energy', text: '284.80' },
  ]);
});

test('the count is written above the energy, read downwards to the peak', () => {
  expect(peakLabelLines(carbon, { showCounts: true })).toStrictEqual([
    { kind: 'counts', text: '12,345' },
    { kind: 'energy', text: '284.80' },
  ]);
});

test('a caption sits nearest the peak it names', () => {
  expect(peakLabelLines(carbon, { caption: 'C 1s' })).toStrictEqual([
    { kind: 'energy', text: '284.80' },
    { kind: 'caption', text: 'C 1s' },
  ]);
});

test('a caption nobody supplied consumes no slot', () => {
  expect(peakLabelLines(carbon, { caption: '' })).toStrictEqual([
    { kind: 'energy', text: '284.80' },
  ]);
});

test('a chart on the kinetic axis writes the energy it is drawn at', () => {
  expect(peakLabelLines(carbon, { energy: 715.2 })).toStrictEqual([
    { kind: 'energy', text: '715.20' },
  ]);
});

test('one line stands the clear space above the peak', () => {
  expect(labelStackBaselines(100, 1, [0, 300])).toStrictEqual(
    Float64Array.from([100 - PEAK_LABEL.topPad]),
  );
});

test('two lines are stacked upwards, the last one nearest the peak', () => {
  expect(labelStackBaselines(100, 2, [0, 300])).toStrictEqual(
    Float64Array.from([79, 90]),
  );
});

test('a stack that would leave the plot is pushed back down whole', () => {
  const baselines = labelStackBaselines(12, 2, [0, 300]);

  expect(baselines).toStrictEqual(Float64Array.from([11, 22]));
  // Pushed as one block, so the lines keep their spacing.
  expect((baselines[1] as number) - (baselines[0] as number)).toBe(
    PEAK_LABEL.lineHeight,
  );
});

test('a stack already clear of the top edge is left where it is', () => {
  expect(labelStackBaselines(200, 1, [0, 300])).toStrictEqual(
    Float64Array.from([190]),
  );
});

test('a stack of no lines is no baselines', () => {
  expect(labelStackBaselines(100, 0, [0, 300])).toStrictEqual(
    new Float64Array(0),
  );
  expect(labelStackBaselines(100, Number.NaN, [0, 300])).toStrictEqual(
    new Float64Array(0),
  );
});
