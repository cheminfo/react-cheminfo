import { expect, test } from 'vitest';

import type { PeakRow } from '../peakRows.ts';
import {
  PEAK_TABLE_HEADER,
  buildPeakRows,
  peakCells,
  peakElementText,
} from '../peakRows.ts';

import { peakFixture, spectrumFixture } from './panelFixture.ts';

test('a peak carries both axes, and the kinetic one is the source less the binding', () => {
  const spectrum = spectrumFixture('carbon', {
    sourceEnergy: 1486.6,
    peaks: [peakFixture('one', 284, 12345, 1.4)],
  });

  const rows = buildPeakRows(spectrum, { tolerance: 0.5 });

  expect(rows).toHaveLength(1);
  expect(rows[0]?.peakId).toBe('one');
  expect(rows[0]?.bindingEnergy).toBe(284);
  expect(rows[0]?.kineticEnergy).toBeCloseTo(1202.6, 10);
  expect(rows[0]?.intensity).toBe(12345);
  expect(rows[0]?.width).toBe(1.4);
});

test('a file stating no photon energy has no kinetic column to fill', () => {
  const spectrum = spectrumFixture('auger', {
    sourceEnergy: null,
    peaks: [peakFixture('one', 284)],
  });
  const row = buildPeakRows(spectrum, { tolerance: 0.5 })[0] as PeakRow;

  expect(row.kineticEnergy).toBeNull();
});

test('a photon energy of zero is no photon energy, not a conversion by zero', () => {
  const spectrum = spectrumFixture('unstated', {
    sourceEnergy: 0,
    peaks: [peakFixture('one', 284)],
  });
  const row = buildPeakRows(spectrum, { tolerance: 0.5 })[0] as PeakRow;

  expect(row.kineticEnergy).toBeNull();
});

test('the closest published level is offered, with the others counted beside it', () => {
  const spectrum = spectrumFixture('carbon', {
    peaks: [peakFixture('one', 284)],
  });

  const row = buildPeakRows(spectrum, { tolerance: 0.5 })[0] as PeakRow;

  expect(row.element).toBe('C');
  expect(row.orbital).toBe('1s');
  expect(row.delta).toBe(0);
  // C 1s and Ru 3d3/2 both sit at 284 eV, which is exactly why one energy never
  // identifies an element on its own. Eu 4p1/2 is there too and is left out:
  // it is a minor line, and no analyst calls a peak europium on the strength of
  // one.
  expect(row.candidates).toBe(2);
  expect(peakElementText(row)).toBe('C 1s +1');
});

test('one level alone is written without a count of the others', () => {
  const spectrum = spectrumFixture('oxygen', {
    peaks: [peakFixture('one', 532.4)],
  });

  const row = buildPeakRows(spectrum, { tolerance: 0.5 })[0] as PeakRow;

  expect(row.element).toBe('O');
  expect(row.orbital).toBe('1s');
  expect(row.delta).toBeCloseTo(0.4, 10);
  expect(row.candidates).toBe(1);
  expect(peakElementText(row)).toBe('O 1s');
});

test('a peak nothing accounts for says so rather than guessing', () => {
  const spectrum = spectrumFixture('nothing', {
    peaks: [peakFixture('one', 1e9)],
  });

  const row = buildPeakRows(spectrum)[0] as PeakRow;

  expect(row.element).toBeNull();
  expect(row.orbital).toBeNull();
  expect(row.delta).toBeNull();
  expect(row.candidates).toBe(0);
  expect(peakElementText(row)).toBe('—');
});

test('a wider window offers more, which is what widening it is for', () => {
  const spectrum = spectrumFixture('charging', {
    peaks: [peakFixture('one', 284.8)],
  });

  const narrow = buildPeakRows(spectrum, { tolerance: 0.5 })[0] as PeakRow;
  const wide = buildPeakRows(spectrum, { tolerance: 2 })[0] as PeakRow;

  expect(narrow.element).toBeNull();
  expect(wide.element).toBe('C');
  expect(wide.delta).toBeCloseTo(0.8, 10);
});

test('a spectrum with no detection yet has no rows rather than empty ones', () => {
  expect(buildPeakRows(spectrumFixture('fresh'))).toStrictEqual([]);
});

test('the table taken away carries every column the panel shows', () => {
  const spectrum = spectrumFixture('carbon', {
    sourceEnergy: 1486.6,
    peaks: [peakFixture('one', 284, 12345, 1.4), peakFixture('two', 1e9, 8, 3)],
  });

  expect(PEAK_TABLE_HEADER).toStrictEqual([
    'binding energy (eV)',
    'kinetic energy (eV)',
    'counts',
    'width (eV)',
    'element',
    'level',
    'delta (eV)',
  ]);
  expect(peakCells(buildPeakRows(spectrum, { tolerance: 0.5 }))).toStrictEqual([
    ['284.00', '1202.60', '12,345', '1.40', 'C', '1s', '+0.00'],
    ['1000000000.00', '-999998513.40', '8.00', '3.00', '', '', ''],
  ]);
});

test('a spectrum on the kinetic axis gives an empty kinetic cell', () => {
  const spectrum = spectrumFixture('auger', {
    sourceEnergy: null,
    peaks: [peakFixture('one', 284, 1000, 1)],
  });

  expect(peakCells(buildPeakRows(spectrum, { tolerance: 0.5 }))).toStrictEqual([
    ['284.00', '', '1,000', '1.00', 'C', '1s', '+0.00'],
  ]);
});

test('an empty table has no lines under its header', () => {
  expect(peakCells([])).toStrictEqual([]);
});
