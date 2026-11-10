import { expect, test } from 'vitest';

import { buildComponentRows, totalComponentArea } from '../componentRows.ts';

import {
  componentFixture,
  regionFixture,
  spectrumFixture,
} from './panelFixture.ts';

test('a component is listed with the window it was fitted inside', () => {
  const spectrum = spectrumFixture('carbon', {
    regions: [regionFixture('C 1s', 282, 292, 'Shirley')],
    components: [
      componentFixture('c1', 284.6, 1000, {
        label: 'C 1s C-C',
        fwhm: 1.2,
        relativeSensitivityFactor: 0.278,
        regionId: 'C 1s',
      }),
    ],
  });

  expect(buildComponentRows(spectrum)).toStrictEqual([
    {
      componentId: 'c1',
      label: 'C 1s C-C',
      bindingEnergy: 284.6,
      fwhm: 1.2,
      area: 1000,
      relativeSensitivityFactor: 0.278,
      shape: 'GL(30)',
      regionLabel: 'C 1s',
      backgroundType: 'Shirley',
    },
  ]);
});

test('a component belonging to no region says so rather than borrowing one', () => {
  const spectrum = spectrumFixture('carbon', {
    regions: [regionFixture('C 1s', 282, 292)],
    components: [componentFixture('loose', 286.2, 400)],
  });

  const row = buildComponentRows(spectrum)[0];

  expect(row?.regionLabel).toBeNull();
  expect(row?.backgroundType).toBeNull();
});

test('a region the file never defined is left null instead of throwing', () => {
  const spectrum = spectrumFixture('carbon', {
    components: [componentFixture('orphan', 284.6, 100, { regionId: 'gone' })],
  });

  const row = buildComponentRows(spectrum)[0];

  expect(row?.componentId).toBe('orphan');
  expect(row?.regionLabel).toBeNull();
});

test('the fit is listed in the order the file wrote it, not by energy', () => {
  const spectrum = spectrumFixture('molybdenum', {
    components: [
      componentFixture('main', 229.1, 3000, { label: 'Mo 3d5/2' }),
      componentFixture('satellite', 232.2, 2000, { label: 'Mo 3d3/2' }),
      componentFixture('sulphur', 226.5, 500, { label: 'S 2s' }),
    ],
  });

  expect(buildComponentRows(spectrum).map((row) => row.label)).toStrictEqual([
    'Mo 3d5/2',
    'Mo 3d3/2',
    'S 2s',
  ]);
});

test('a spectrum carrying no fit has no rows rather than empty ones', () => {
  expect(buildComponentRows(spectrumFixture('survey'))).toStrictEqual([]);
});

test('the areas of a fit add up to what the envelope was decomposed into', () => {
  const spectrum = spectrumFixture('carbon', {
    components: [
      componentFixture('c1', 284.6, 1000),
      componentFixture('c2', 286.2, 400),
      componentFixture('c3', 288.5, 100),
    ],
  });

  expect(totalComponentArea(buildComponentRows(spectrum))).toBe(1500);
  expect(totalComponentArea([])).toBe(0);
});

test('an area the file wrote as nothing usable does not poison the total', () => {
  const spectrum = spectrumFixture('carbon', {
    components: [
      componentFixture('good', 284.6, 1000),
      componentFixture('broken', 286.2, Number.NaN),
    ],
  });

  expect(totalComponentArea(buildComponentRows(spectrum))).toBe(1000);
});
