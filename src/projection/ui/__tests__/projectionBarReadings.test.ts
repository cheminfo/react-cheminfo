/*
 * What the settings at the far end of the bar currently read. The same words
 * decide how much room the bar needs and what the chip writes when a narrow
 * figure gathers them, so a reading that drifts folds the bar at one width and
 * writes a different answer at another.
 */

import { expect, test } from 'vitest';

import {
  DEFAULT_PROJECTION_OPTIONS,
  PROJECTION_COPY,
} from '../../core/index.ts';
import { projectionBarReadings } from '../projectionBarReadings.ts';

const GROUPS = {
  label: 'Species',
  entries: [
    { id: 'setosa', label: 'setosa', color: '#0072b2', count: 50 },
    { id: 'versicolor', label: 'versicolor', color: '#d55e00', count: 50 },
  ],
  groupOf: new Int32Array(100),
};

test('the map reads what the colour means and how wide the rings are drawn', () => {
  expect(readings('map')).toStrictEqual([
    {
      key: 'Colour',
      label: 'Colour by',
      value: 'Species',
      swatches: ['#0072b2', '#d55e00'],
    },
    { key: 'Outlines', label: 'Group outlines', value: '95%' },
  ]);
});

test('an uncoloured map says so, and carries no dots contradicting it', () => {
  const uncoloured = readings('map', { colorBy: 'none' });

  expect(uncoloured[0]?.value).toBe('Nothing');
  expect(uncoloured[0]?.swatches).toStrictEqual([]);
});

test('a map with no rings reads as none rather than as an empty share', () => {
  expect(readings('map', { ellipse: null })[1]?.value).toBe('None');
});

test('the three other tabs each read their one setting', () => {
  expect(readings('pairs')).toStrictEqual([
    { key: 'Components', label: 'Components', value: '4', stepper: true },
  ]);
  expect(readings('variables')).toStrictEqual([
    { key: 'Show', label: 'Show', value: 'Effect on a sample' },
  ]);
  expect(readings('shares')).toStrictEqual([
    { key: 'Target', label: 'Target', value: '95%', stepper: true },
  ]);
});

/**
 * What one tab writes at the far end of an iris bar.
 * @param tab - The tab showing.
 * @param patch - Whatever the figure is showing differently.
 * @returns The readings.
 */
function readings(
  tab: 'map' | 'pairs' | 'variables' | 'shares',
  patch: Partial<typeof DEFAULT_PROJECTION_OPTIONS> = {},
) {
  return projectionBarReadings({
    tab,
    copy: PROJECTION_COPY,
    options: { ...DEFAULT_PROJECTION_OPTIONS, ...patch },
    groups: GROUPS,
  });
}
