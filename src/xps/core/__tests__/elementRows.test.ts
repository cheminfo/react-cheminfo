import { expect, test } from 'vitest';

import { buildElementRows, countIdentifiedPeaks } from '../elementRows.ts';

import { peakFixture } from './panelFixture.ts';

test('an element seen twice outranks the ones seen once', () => {
  // 24 eV is O 2s, and 532 eV is O 1s: two levels of one element, which is what
  // makes oxygen a claim rather than a coincidence. Kr 4s and the three Sn 4d
  // levels also sit at 24 eV.
  const rows = buildElementRows(
    [peakFixture('low', 24), peakFixture('high', 532)],
    { tolerance: 0.5 },
  );

  expect(rows).toStrictEqual([
    {
      element: 'O',
      peaks: 2,
      energies: [24, 532],
      orbitals: ['2s', '1s'],
      closest: 0,
    },
    // Kr 4s and Sn 4d3/2 also sit at 24 eV and are both minor lines, so
    // krypton is not offered at all and tin is offered by its 4d5/2 alone.
    {
      element: 'Sn',
      peaks: 1,
      energies: [24],
      orbitals: ['4d5/2', '4d'],
      closest: 0,
    },
  ]);
});

test('two levels of one element on one peak are still one peak', () => {
  const rows = buildElementRows([peakFixture('low', 24)], { tolerance: 0.5 });
  const tin = rows.find((row) => row.element === 'Sn');

  expect(tin?.peaks).toBe(1);
  expect(tin?.orbitals).toStrictEqual(['4d5/2', '4d']);
});

test('the closest match of an element is the signed distance it is judged on', () => {
  const rows = buildElementRows(
    [peakFixture('shifted', 532.4), peakFixture('further', 24.5)],
    { tolerance: 0.6 },
  );
  const oxygen = rows.find((row) => row.element === 'O');

  expect(oxygen?.peaks).toBe(2);
  expect(oxygen?.closest).toBeCloseTo(0.4, 10);
});

test('a peak nothing accounts for contributes to no element at all', () => {
  const rows = buildElementRows(
    [peakFixture('carbon', 284), peakFixture('nothing', 1e9)],
    { tolerance: 0.5 },
  );

  // Eu is at 284 eV too, by its 4p1/2, which is a minor line and so not an
  // answer to what the peak is.
  expect(rows.map((row) => row.element)).toStrictEqual(['C', 'Ru']);

  for (const row of rows) expect(row.energies).toStrictEqual([284]);
});

test('nothing picked identifies nothing', () => {
  expect(buildElementRows([])).toStrictEqual([]);
  expect(countIdentifiedPeaks([])).toBe(0);
});

test('how many peaks were identified is what says the window is too narrow', () => {
  const peaks = [
    peakFixture('carbon', 284),
    peakFixture('oxygen', 532),
    peakFixture('nothing', 1e9),
  ];

  expect(countIdentifiedPeaks(peaks, { tolerance: 0.5 })).toBe(2);
  expect(countIdentifiedPeaks(peaks, { tolerance: 0 })).toBe(0);
});
