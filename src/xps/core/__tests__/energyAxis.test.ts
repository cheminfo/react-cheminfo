import { expect, test } from 'vitest';

import {
  axisEnergy,
  axisTitle,
  axisTrace,
  bindingFromAxis,
  chartEnergyAxis,
  chartSourceEnergy,
  countsTitle,
  isAxisReversed,
} from '../energyAxis.ts';
import { DEFAULT_SETTINGS } from '../xpsState.ts';

import { spectrumFixture } from './spectrumFixture.ts';

const kineticSettings = { ...DEFAULT_SETTINGS, energyAxis: 'kinetic' } as const;

test('a spectrum that states a photon energy is drawn on binding energy', () => {
  const spectrum = spectrumFixture('a');

  expect(chartEnergyAxis([spectrum], DEFAULT_SETTINGS)).toBe('binding');
  expect(chartSourceEnergy([spectrum])).toBe(1000);
});

test('asking for kinetic energy is always granted', () => {
  expect(chartEnergyAxis([spectrumFixture('a')], kineticSettings)).toBe(
    'kinetic',
  );
});

test('a spectrum with no photon energy has no binding axis to be drawn on', () => {
  const auger = spectrumFixture('a', { sourceEnergy: null });

  expect(chartEnergyAxis([auger], DEFAULT_SETTINGS)).toBe('kinetic');
  expect(chartSourceEnergy([auger])).toBeNull();
});

test('one convertible spectrum is enough to keep the binding axis', () => {
  const auger = spectrumFixture('a', { sourceEnergy: null });
  const measured = spectrumFixture('b');

  expect(chartEnergyAxis([auger, measured], DEFAULT_SETTINGS)).toBe('binding');
  expect(chartSourceEnergy([auger, measured])).toBe(1000);
});

test('a hidden spectrum decides neither the axis nor the photon energy', () => {
  const hidden = spectrumFixture('a', { visible: false });
  const auger = spectrumFixture('b', { sourceEnergy: null });

  expect(chartEnergyAxis([hidden, auger], DEFAULT_SETTINGS)).toBe('kinetic');
  expect(chartSourceEnergy([hidden, auger])).toBeNull();
});

test('an empty chart follows the setting rather than flipping its own axis', () => {
  expect(chartEnergyAxis([], DEFAULT_SETTINGS)).toBe('binding');
  expect(chartEnergyAxis([], kineticSettings)).toBe('kinetic');
  expect(chartSourceEnergy([])).toBeNull();
});

test('the kinetic trace runs the other way round', () => {
  const spectrum = spectrumFixture('a');

  expect(axisTrace(spectrum, 'binding').x).toStrictEqual(
    Float64Array.from([280, 285, 290]),
  );
  expect(axisTrace(spectrum, 'kinetic').x).toStrictEqual(
    Float64Array.from([720, 715, 710]),
  );
});

test('a spectrum with no kinetic trace answers with the one it has', () => {
  const auger = spectrumFixture('a', { sourceEnergy: null });

  expect(axisTrace(auger, 'kinetic')).toBe(auger.energy);
  expect(axisTrace(auger, 'binding')).toBe(auger.energy);
});

test('an energy is placed on whichever axis is drawn, and read back', () => {
  expect(axisEnergy(285, 1000, 'binding')).toBe(285);
  expect(axisEnergy(285, 1000, 'kinetic')).toBe(715);
  expect(bindingFromAxis(715, 1000, 'kinetic')).toBe(285);
  expect(bindingFromAxis(285, 1000, 'binding')).toBe(285);
});

test('an energy with no photon energy behind it is never converted', () => {
  expect(axisEnergy(285, null, 'kinetic')).toBe(285);
  expect(bindingFromAxis(285, null, 'kinetic')).toBe(285);
  expect(axisEnergy(285, 0, 'kinetic')).toBe(285);
});

test('only the binding axis is drawn backwards', () => {
  expect(isAxisReversed('binding')).toBe(true);
  expect(isAxisReversed('kinetic')).toBe(false);
});

test('the axes say what they are', () => {
  expect(axisTitle('binding')).toBe('Binding energy (eV)');
  expect(axisTitle('kinetic')).toBe('Kinetic energy (eV)');
  expect(countsTitle(false)).toBe('Counts');
  expect(countsTitle(true)).toBe('Normalised counts');
});
