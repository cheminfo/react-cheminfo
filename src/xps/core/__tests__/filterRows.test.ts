import { expect, test } from 'vitest';

import type { ComponentRow } from '../componentRows.ts';
import { filterComponentRows, filterPeakRows } from '../filterRows.ts';
import type { PeakRow } from '../peakRows.ts';

/**
 * One peak row, with only what the filter reads filled in.
 * @param bindingEnergy - Where it sits, in eV.
 * @param element - The element offered for it, `null` for none.
 * @param orbital - That level, `null` for none.
 * @param kineticEnergy - Where it sits in kinetic energy, `null` for none.
 * @returns The row.
 */
function peakRow(
  bindingEnergy: number,
  element: string | null = null,
  orbital: string | null = null,
  kineticEnergy: number | null = null,
): PeakRow {
  return {
    peakId: `peak-${bindingEnergy}`,
    bindingEnergy,
    kineticEnergy,
    intensity: 1000,
    width: 1,
    element,
    orbital,
    delta: element === null ? null : 0,
    candidates: element === null ? 0 : 1,
  };
}

/**
 * One fit row, with only what the filter reads filled in.
 * @param label - What the fit calls it.
 * @param bindingEnergy - Where it sits, in eV.
 * @param shape - The peak shape the fit used.
 * @param regionLabel - What the region it belongs to is called.
 * @returns The row.
 */
function componentRow(
  label: string,
  bindingEnergy: number,
  shape = 'GL(30)',
  regionLabel: string | null = null,
): ComponentRow {
  return {
    componentId: label,
    label,
    bindingEnergy,
    fwhm: 1,
    area: 1000,
    relativeSensitivityFactor: null,
    shape,
    regionLabel,
    backgroundType: regionLabel === null ? null : 'Shirley',
  };
}

test('nothing typed leaves the rows untouched, and uncopied', () => {
  const rows = [peakRow(284.6), peakRow(532)];

  expect(filterPeakRows(rows, '')).toBe(rows);
  expect(filterPeakRows(rows, ' '.repeat(3))).toBe(rows);
});

test('an energy matches as the table writes it, not as it is stored', () => {
  const rows = [peakRow(284.6), peakRow(532.043), peakRow(1071.9)];

  expect(
    filterPeakRows(rows, '284.6').map((row) => row.bindingEnergy),
  ).toStrictEqual([284.6]);
  // The column writes two decimals, so the third is not there to be matched.
  expect(filterPeakRows(rows, '532.043')).toStrictEqual([]);
  expect(
    filterPeakRows(rows, '532.04').map((row) => row.bindingEnergy),
  ).toStrictEqual([532.043]);
});

test('a whole number of eV finds every peak written with it', () => {
  const rows = [peakRow(284.6), peakRow(284.9), peakRow(532)];

  expect(filterPeakRows(rows, '284')).toHaveLength(2);
});

test('an element symbol and a level are both matched, whatever the case', () => {
  const rows = [
    peakRow(284.6, 'C', '1s'),
    peakRow(229.1, 'Mo', '3d5/2'),
    peakRow(532, 'O', '1s'),
  ];

  expect(filterPeakRows(rows, 'mo').map((row) => row.element)).toStrictEqual([
    'Mo',
  ]);
  expect(filterPeakRows(rows, '3d').map((row) => row.element)).toStrictEqual([
    'Mo',
  ]);
  expect(filterPeakRows(rows, '1s')).toHaveLength(2);
});

test('the kinetic energy is searchable too, since it is a column of its own', () => {
  const rows = [
    peakRow(284.6, null, null, 1202),
    peakRow(532, null, null, 954),
  ];

  expect(
    filterPeakRows(rows, '1202').map((row) => row.bindingEnergy),
  ).toStrictEqual([284.6]);
});

test('a query nothing answers leaves an empty table rather than everything', () => {
  expect(filterPeakRows([peakRow(284.6)], 'zzz')).toStrictEqual([]);
});

test('a fit is filtered by label, energy, shape or region', () => {
  const rows = [
    componentRow('C 1s aliphatic', 284.6, 'GL(30)', 'C 1s'),
    componentRow('Mo 3d5/2 MoS2', 229.1, 'LA(1.2,85,50)', 'Mo 3d'),
    componentRow('S 2s', 226.5),
  ];

  expect(
    filterComponentRows(rows, 'mos2').map((row) => row.componentId),
  ).toStrictEqual(['Mo 3d5/2 MoS2']);
  expect(
    filterComponentRows(rows, '226.5').map((row) => row.componentId),
  ).toStrictEqual(['S 2s']);
  expect(
    filterComponentRows(rows, 'la(').map((row) => row.componentId),
  ).toStrictEqual(['Mo 3d5/2 MoS2']);
  expect(
    filterComponentRows(rows, 'c 1s').map((row) => row.componentId),
  ).toStrictEqual(['C 1s aliphatic']);
});

test('an unfiltered fit table is handed straight back', () => {
  const rows = [componentRow('C 1s', 284.6)];

  expect(filterComponentRows(rows, '')).toBe(rows);
  expect(filterComponentRows(rows, 'nothing')).toStrictEqual([]);
});
