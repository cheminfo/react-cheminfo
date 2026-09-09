import { expect, test } from 'vitest';

import { BANNED_COLORS } from '../../../tokens/core/rules.ts';
import { CHART_SERIES_COLORS, chartSeriesColor } from '../chartPalette.ts';

test('the palette is the eight Okabe-Ito hues, none of them a banned colour', () => {
  expect(CHART_SERIES_COLORS).toStrictEqual([
    '#0072b2',
    '#d55e00',
    '#009e73',
    '#cc79a7',
    '#e69f00',
    '#56b4e9',
    '#f0e442',
    '#4d4d4d',
  ]);

  const banned: string[] = [];
  for (const color of CHART_SERIES_COLORS) {
    if (BANNED_COLORS.has(color.slice(1))) banned.push(color);
  }

  expect(banned).toStrictEqual([]);
});

test('each role walks the palette in its own order', () => {
  expect(chartSeriesColor(0, 'group')).toBe('#0072b2');
  expect(chartSeriesColor(0, 'component')).toBe('#e69f00');
  expect(chartSeriesColor(0)).toBe(chartSeriesColor(0, 'group'));

  expect(colorsOfRole('group')).toStrictEqual([
    '#0072b2',
    '#d55e00',
    '#009e73',
    '#cc79a7',
    '#f0e442',
    '#4d4d4d',
    '#e69f00',
    '#56b4e9',
  ]);
  expect(colorsOfRole('component')).toStrictEqual([
    '#e69f00',
    '#56b4e9',
    '#4d4d4d',
    '#f0e442',
    '#0072b2',
    '#d55e00',
    '#009e73',
    '#cc79a7',
  ]);
});

test('the first four of each role share no hue, so blue means one thing', () => {
  const hues = new Set<string>();
  for (let index = 0; index < 4; index++) {
    hues.add(chartSeriesColor(index, 'group'));
    hues.add(chartSeriesColor(index, 'component'));
  }

  expect(hues.size).toBe(8);
});

test('a ninth series starts the palette again and a broken index takes the first', () => {
  expect(chartSeriesColor(8, 'group')).toBe(chartSeriesColor(0, 'group'));
  expect(chartSeriesColor(9, 'component')).toBe(
    chartSeriesColor(1, 'component'),
  );
  expect(chartSeriesColor(-1, 'group')).toBe(chartSeriesColor(0, 'group'));
  expect(chartSeriesColor(Number.NaN, 'group')).toBe('#0072b2');
  expect(chartSeriesColor(2.7, 'group')).toBe(chartSeriesColor(2, 'group'));
});

function colorsOfRole(role: 'group' | 'component'): string[] {
  const colors: string[] = [];
  for (let index = 0; index < CHART_SERIES_COLORS.length; index++) {
    colors.push(chartSeriesColor(index, role));
  }
  return colors;
}
