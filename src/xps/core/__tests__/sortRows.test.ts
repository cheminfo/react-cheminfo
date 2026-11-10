import { expect, test } from 'vitest';

import type { ComponentRow } from '../componentRows.ts';
import type { PeakRow } from '../peakRows.ts';
import { sortComponentRows, sortPeakRows } from '../sortRows.ts';

/**
 * One peak row, with only what an order reads filled in.
 * @param bindingEnergy - Where it sits, in eV.
 * @param intensity - The counts at the maximum.
 * @param width - Width at half maximum in eV.
 * @param element - The element offered for it, `null` for none.
 * @returns The row.
 */
function peakRow(
  bindingEnergy: number,
  intensity: number,
  width = 1,
  element: string | null = null,
): PeakRow {
  return {
    peakId: `peak-${bindingEnergy}`,
    bindingEnergy,
    kineticEnergy: null,
    intensity,
    width,
    element,
    orbital: element === null ? null : '1s',
    delta: element === null ? null : 0,
    candidates: element === null ? 0 : 1,
  };
}

/**
 * One fit row, with only what an order reads filled in.
 * @param label - What the fit calls it.
 * @param bindingEnergy - Where it sits, in eV.
 * @param area - Area under it.
 * @param fwhm - Full width at half maximum, in eV.
 * @returns The row.
 */
function componentRow(
  label: string,
  bindingEnergy: number,
  area: number,
  fwhm = 1,
): ComponentRow {
  return {
    componentId: label,
    label,
    bindingEnergy,
    fwhm,
    area,
    relativeSensitivityFactor: null,
    shape: 'GL(30)',
    regionLabel: null,
    backgroundType: null,
  };
}

test('peaks are read up the binding energy axis by default', () => {
  const rows = sortPeakRows(
    [peakRow(532, 10), peakRow(284, 100), peakRow(24, 5)],
    'bindingEnergy',
    true,
  );

  expect(rows.map((row) => row.bindingEnergy)).toStrictEqual([24, 284, 532]);
});

test('turning a column round reverses it and nothing else', () => {
  const rows = sortPeakRows(
    [peakRow(24, 5), peakRow(284, 100), peakRow(532, 10)],
    'intensity',
    false,
  );

  expect(rows.map((row) => row.intensity)).toStrictEqual([100, 10, 5]);
});

test('sorting is a copy, so the rows handed in keep their own order', () => {
  const given = [peakRow(532, 10), peakRow(284, 100)];
  const sorted = sortPeakRows(given, 'bindingEnergy', true);

  expect(sorted).not.toBe(given);
  expect(given.map((row) => row.bindingEnergy)).toStrictEqual([532, 284]);
});

test('a column that cannot separate two rows falls back to the energy axis', () => {
  const rows = sortPeakRows(
    [peakRow(532, 100), peakRow(24, 100), peakRow(284, 100)],
    'intensity',
    false,
  );

  expect(rows.map((row) => row.bindingEnergy)).toStrictEqual([24, 284, 532]);
});

test('a peak nothing identified sinks whichever way the column is turned', () => {
  const rows = [
    peakRow(24, 5),
    peakRow(284, 100, 1, 'C'),
    peakRow(532, 10, 1, 'O'),
  ];

  expect(
    sortPeakRows(rows, 'element', true).map((row) => row.element),
  ).toStrictEqual(['C', 'O', null]);
  expect(
    sortPeakRows(rows, 'element', false).map((row) => row.element),
  ).toStrictEqual(['O', 'C', null]);
});

test('the width column orders the broad peaks against the sharp ones', () => {
  const rows = sortPeakRows(
    [peakRow(284, 100, 2.4), peakRow(532, 10, 0.8), peakRow(24, 5, 1.6)],
    'width',
    false,
  );

  expect(rows.map((row) => row.width)).toStrictEqual([2.4, 1.6, 0.8]);
});

test('a fit is ordered by label, energy, width or area', () => {
  const rows = [
    componentRow('C 1s ether', 286.2, 400, 1.6),
    componentRow('C 1s aliphatic', 284.6, 1000, 1.2),
    componentRow('C 1s carbonate', 288.9, 100, 1.4),
  ];

  expect(
    sortComponentRows(rows, 'label', true).map((row) => row.label),
  ).toStrictEqual(['C 1s aliphatic', 'C 1s carbonate', 'C 1s ether']);
  expect(
    sortComponentRows(rows, 'bindingEnergy', true).map(
      (row) => row.bindingEnergy,
    ),
  ).toStrictEqual([284.6, 286.2, 288.9]);
  expect(
    sortComponentRows(rows, 'area', false).map((row) => row.area),
  ).toStrictEqual([1000, 400, 100]);
  expect(
    sortComponentRows(rows, 'fwhm', true).map((row) => row.fwhm),
  ).toStrictEqual([1.2, 1.4, 1.6]);
});

test('two components of the same area are still read up the energy axis', () => {
  const rows = sortComponentRows(
    [
      componentRow('high', 288.9, 500),
      componentRow('low', 284.6, 500),
      componentRow('middle', 286.2, 500),
    ],
    'area',
    false,
  );

  expect(rows.map((row) => row.label)).toStrictEqual(['low', 'middle', 'high']);
});
