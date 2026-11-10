import { expect, test } from 'vitest';

import { quantifyComponents } from '../quantify.ts';

import { syntheticComponent, syntheticSpectrum } from './syntheticSpectrum.ts';

test('two components of equal area and sensitivity are half each', () => {
  const spectrum = syntheticSpectrum(
    'carbon',
    [
      syntheticComponent('C 1s A', 100, { relativeSensitivityFactor: 0.25 }),
      syntheticComponent('C 1s B', 100, { relativeSensitivityFactor: 0.25 }),
    ],
    { element: 'C' },
  );

  expect(quantifyComponents([spectrum])).toStrictEqual([
    {
      key: 'C 1s A',
      element: 'C',
      area: 100,
      relativeSensitivityFactor: 0.25,
      correctedArea: 400,
      atomicFraction: 0.5,
      assumedSensitivity: false,
    },
    {
      key: 'C 1s B',
      element: 'C',
      area: 100,
      relativeSensitivityFactor: 0.25,
      correctedArea: 400,
      atomicFraction: 0.5,
      assumedSensitivity: false,
    },
  ]);
});

test('the sensitivity factor is what makes two areas comparable', () => {
  const spectrum = syntheticSpectrum('sample', [
    syntheticComponent('C 1s', 100, { relativeSensitivityFactor: 1 }),
    syntheticComponent('O 1s', 300, { relativeSensitivityFactor: 3 }),
  ]);

  const composition = quantifyComponents([spectrum]);

  expect(composition.map((entry) => entry.correctedArea)).toStrictEqual([
    100, 100,
  ]);
  expect(composition.map((entry) => entry.atomicFraction)).toStrictEqual([
    0.5, 0.5,
  ]);
});

test('a component stating no factor is quantified at one and says so', () => {
  const spectrum = syntheticSpectrum('sample', [
    syntheticComponent('C 1s', 250),
    syntheticComponent('O 1s', 750, { relativeSensitivityFactor: 1 }),
  ]);

  const composition = quantifyComponents([spectrum]);

  expect(composition[0]).toStrictEqual({
    key: 'O 1s',
    element: 'O',
    area: 750,
    relativeSensitivityFactor: 1,
    correctedArea: 750,
    atomicFraction: 0.75,
    assumedSensitivity: false,
  });
  expect(composition[1]?.key).toBe('C 1s');
  expect(composition[1]?.assumedSensitivity).toBe(true);
  expect(composition[1]?.relativeSensitivityFactor).toBe(1);
  expect(composition[1]?.atomicFraction).toBe(0.25);
});

test('the largest share is read first', () => {
  const spectrum = syntheticSpectrum('sample', [
    syntheticComponent('C 1s', 100, { relativeSensitivityFactor: 1 }),
    syntheticComponent('O 1s', 300, { relativeSensitivityFactor: 1 }),
  ]);

  const composition = quantifyComponents([spectrum]);

  expect(composition.map((entry) => entry.key)).toStrictEqual(['O 1s', 'C 1s']);
});

test('grouping adds the components of one element together', () => {
  const spectrum = syntheticSpectrum('sample', [
    syntheticComponent('C 1s A', 100, { relativeSensitivityFactor: 1 }),
    syntheticComponent('C 1s B', 200, { relativeSensitivityFactor: 1 }),
    syntheticComponent('O 1s', 100, { relativeSensitivityFactor: 1 }),
  ]);

  const composition = quantifyComponents([spectrum], { groupByElement: true });

  expect(composition).toStrictEqual([
    {
      key: 'C',
      element: 'C',
      area: 300,
      relativeSensitivityFactor: 1,
      correctedArea: 300,
      atomicFraction: 0.75,
      assumedSensitivity: false,
    },
    {
      key: 'O',
      element: 'O',
      area: 100,
      relativeSensitivityFactor: 1,
      correctedArea: 100,
      atomicFraction: 0.25,
      assumedSensitivity: false,
    },
  ]);
});

test('a component names its own element even inside another scan', () => {
  const spectrum = syntheticSpectrum(
    'molybdenum',
    [
      syntheticComponent('Mo 3d MoS2 2H', 300, {
        relativeSensitivityFactor: 1,
      }),
      syntheticComponent('S 2s', 100, { relativeSensitivityFactor: 1 }),
    ],
    { element: 'Mo' },
  );

  const composition = quantifyComponents([spectrum]);

  expect(composition.map((entry) => entry.element)).toStrictEqual(['Mo', 'S']);
});

test('a label naming nothing falls back to what the scan was of', () => {
  const named = syntheticSpectrum(
    'nitrogen',
    [syntheticComponent('Peak 1', 100, { relativeSensitivityFactor: 1 })],
    { element: 'N' },
  );
  const survey = syntheticSpectrum('survey', [
    syntheticComponent('Peak 1', 100, { relativeSensitivityFactor: 1 }),
  ]);

  expect(quantifyComponents([named])[0]?.element).toBe('N');
  expect(quantifyComponents([survey])[0]?.element).toBeNull();
});

test('components of several spectra make one composition', () => {
  const carbon = syntheticSpectrum(
    'carbon',
    [syntheticComponent('C 1s', 300, { relativeSensitivityFactor: 1 })],
    { element: 'C' },
  );
  const oxygen = syntheticSpectrum(
    'oxygen',
    [syntheticComponent('O 1s', 100, { relativeSensitivityFactor: 1 })],
    { element: 'O' },
  );

  const composition = quantifyComponents([carbon, oxygen]);

  expect(composition).toHaveLength(2);
  expect(composition[0]?.atomicFraction).toBe(0.75);
  expect(composition[1]?.atomicFraction).toBe(0.25);
});

test('nothing fitted has no composition rather than a NaN one', () => {
  const spectrum = syntheticSpectrum('survey', []);

  expect(quantifyComponents([])).toStrictEqual([]);
  expect(quantifyComponents([spectrum])).toStrictEqual([]);
});
