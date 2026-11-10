import { expect, test } from 'vitest';

import {
  assumedWarning,
  buildCompositionRows,
  countAssumed,
} from '../compositionRows.ts';

import { componentFixture, spectrumFixture } from './panelFixture.ts';

test('the bar is drawn against the largest line and not against a hundred', () => {
  const spectrum = spectrumFixture('sample', {
    components: [
      componentFixture('carbon', 284.6, 300, {
        label: 'C 1s',
        relativeSensitivityFactor: 1,
      }),
      componentFixture('oxygen', 532, 100, {
        label: 'O 1s',
        relativeSensitivityFactor: 1,
      }),
    ],
  });

  const rows = buildCompositionRows([spectrum]);

  expect(rows.map((row) => row.key)).toStrictEqual(['C 1s', 'O 1s']);
  expect(rows.map((row) => row.atomicFraction)).toStrictEqual([0.75, 0.25]);
  expect(rows.map((row) => row.share)).toStrictEqual([1, 1 / 3]);
});

test('the sensitivity factor is what the shares are computed through', () => {
  const spectrum = spectrumFixture('sample', {
    components: [
      componentFixture('carbon', 284.6, 100, {
        label: 'C 1s',
        relativeSensitivityFactor: 1,
      }),
      componentFixture('oxygen', 532, 300, {
        label: 'O 1s',
        relativeSensitivityFactor: 3,
      }),
    ],
  });

  const rows = buildCompositionRows([spectrum]);

  expect(rows.map((row) => row.correctedArea)).toStrictEqual([100, 100]);
  expect(rows.map((row) => row.atomicFraction)).toStrictEqual([0.5, 0.5]);
  expect(rows.map((row) => row.share)).toStrictEqual([1, 1]);
});

test('a component stating no factor is quantified at one and flagged', () => {
  const spectrum = spectrumFixture('sample', {
    components: [
      componentFixture('carbon', 284.6, 250, { label: 'C 1s' }),
      componentFixture('oxygen', 532, 750, {
        label: 'O 1s',
        relativeSensitivityFactor: 1,
      }),
    ],
  });

  const rows = buildCompositionRows([spectrum]);

  expect(rows[0]?.key).toBe('O 1s');
  expect(rows[0]?.assumedSensitivity).toBe(false);
  expect(rows[1]?.key).toBe('C 1s');
  expect(rows[1]?.assumedSensitivity).toBe(true);
  expect(rows[1]?.relativeSensitivityFactor).toBe(1);
  expect(countAssumed(rows)).toBe(1);
});

test('grouping adds the components of one element into one line', () => {
  const spectrum = spectrumFixture('carbon', {
    element: 'C',
    components: [
      componentFixture('c1', 284.6, 100, {
        label: 'C 1s aliphatic',
        relativeSensitivityFactor: 1,
      }),
      componentFixture('c2', 286.2, 200, {
        label: 'C 1s ether',
        relativeSensitivityFactor: 1,
      }),
      componentFixture('o1', 532, 100, {
        label: 'O 1s',
        relativeSensitivityFactor: 1,
      }),
    ],
  });

  const grouped = buildCompositionRows([spectrum], { groupByElement: true });

  expect(grouped.map((row) => row.key)).toStrictEqual(['C', 'O']);
  expect(grouped.map((row) => row.atomicFraction)).toStrictEqual([0.75, 0.25]);
  expect(grouped.map((row) => row.share)).toStrictEqual([1, 1 / 3]);
});

test('the fits of several spectra make one composition', () => {
  const carbon = spectrumFixture('carbon', {
    element: 'C',
    components: [
      componentFixture('c1', 284.6, 300, {
        label: 'C 1s',
        relativeSensitivityFactor: 1,
      }),
    ],
  });
  const oxygen = spectrumFixture('oxygen', {
    transitionName: 'O 1s',
    element: 'O',
    components: [
      componentFixture('o1', 532, 100, {
        label: 'O 1s',
        relativeSensitivityFactor: 1,
      }),
    ],
  });

  const rows = buildCompositionRows([carbon, oxygen]);

  expect(rows).toHaveLength(2);
  expect(rows.map((row) => row.element)).toStrictEqual(['C', 'O']);
  expect(rows.map((row) => row.atomicFraction)).toStrictEqual([0.75, 0.25]);
});

test('nothing fitted has no composition rather than a table of zeroes', () => {
  expect(buildCompositionRows([])).toStrictEqual([]);
  expect(buildCompositionRows([spectrumFixture('survey')])).toStrictEqual([]);
  expect(countAssumed([])).toBe(0);
  expect(assumedWarning([])).toBeNull();
});

test('a composition of stated factors is quoted without a warning', () => {
  const spectrum = spectrumFixture('sample', {
    components: [
      componentFixture('c1', 284.6, 100, {
        label: 'C 1s',
        relativeSensitivityFactor: 0.278,
      }),
    ],
  });

  expect(assumedWarning(buildCompositionRows([spectrum]))).toBeNull();
});

test('one assumed factor among several is called out as rescaling the rest', () => {
  const spectrum = spectrumFixture('sample', {
    components: [
      componentFixture('c1', 284.6, 100, { label: 'C 1s' }),
      componentFixture('o1', 532, 100, {
        label: 'O 1s',
        relativeSensitivityFactor: 1,
      }),
    ],
  });

  const warning = assumedWarning(buildCompositionRows([spectrum]));

  expect(warning).toBe(
    'One line of this table carries a sensitivity factor of 1 that the file never stated, which rescales every percentage beside it. Treat the numbers as a ranking rather than as a composition.',
  );
});

test('a fit nobody quantified is said not to be a composition at all', () => {
  const spectrum = spectrumFixture('sample', {
    components: [
      componentFixture('c1', 284.6, 100, { label: 'C 1s' }),
      componentFixture('o1', 532, 100, { label: 'O 1s' }),
    ],
  });

  const rows = buildCompositionRows([spectrum]);

  expect(countAssumed(rows)).toBe(2);
  expect(assumedWarning(rows)).toBe(
    'No component states a sensitivity factor, so these are areas expressed as percentages rather than a composition. Quantify the fit in the software that made it, or read the shares against each other and not as atomic per cent.',
  );
});
