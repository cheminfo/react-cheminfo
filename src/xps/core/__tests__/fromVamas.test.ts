import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { SPECTRUM_COLORS } from '../../../chart/core/spectrumColor.ts';
import { readVamas } from '../fromVamas.ts';

const vamasDirectory = join(import.meta.dirname, 'data');

/**
 * One of the example files, as bytes.
 * @param name - Its name, without the extension.
 * @returns The file.
 */
function readFixture(name: string) {
  return readFileSync(join(vamasDirectory, `${name}.vms`));
}

test('every block of a file becomes a spectrum of its own', () => {
  const spectra = readVamas(readFixture('cellulose_fitted_following_briggs'), {
    fileName: 'cellulose.vms',
    idPrefix: 'cellulose',
  });

  expect(spectra).toHaveLength(4);
  expect(spectra.map((spectrum) => spectrum.name)).toStrictEqual([
    'Sample Name: Cellulose — Survey',
    'Sample Name: Cellulose — C 1s',
    'Sample Name: Cellulose — O 1s',
    'Sample Name: Cellulose — Valence',
  ]);
  expect(spectra.map((spectrum) => spectrum.id)).toStrictEqual([
    'cellulose-0',
    'cellulose-1',
    'cellulose-2',
    'cellulose-3',
  ]);
  expect(spectra[1]?.origin).toStrictEqual({
    format: 'vamas',
    fileName: 'cellulose.vms',
    blockIndex: 1,
    sampleId: 'Sample Name: Cellulose',
  });
});

test('the abscissa comes out ascending and the kinetic axis beside it', () => {
  const [survey, carbon] = readVamas(
    readFixture('cellulose_fitted_following_briggs'),
  );

  expect(carbon?.energy.x).toHaveLength(241);
  expect(carbon?.energy.x[0]).toBe(282.16);
  expect(carbon?.energy.x.at(-1)).toBe(294.16);
  expect(carbon?.sourceEnergy).toBe(1486.6);
  expect(carbon?.kinetic?.x[0]).toBeCloseTo(1204.44, 6);
  expect(carbon?.kinetic?.x.at(-1)).toBeCloseTo(1192.44, 6);
  // The two traces are one measurement read on two axes, never two copies.
  expect(carbon?.kinetic?.y).toBe(carbon?.energy.y);
  expect(survey?.energy.x).toHaveLength(1151);
});

test('the transition is read off the block identifier', () => {
  const spectra = readVamas(readFixture('cellulose_fitted_following_briggs'));

  expect(spectra[1]?.transition).toStrictEqual({
    name: 'C 1s',
    element: 'C',
    shell: 1,
    angularMomentum: 's',
    augerElement: null,
    augerTransition: null,
  });
  expect(spectra[0]?.transition).toStrictEqual({
    name: 'Survey',
    element: null,
    shell: null,
    angularMomentum: null,
    augerElement: null,
    augerTransition: null,
  });
});

test('a fitted block carries the components the file states', () => {
  const spectra = readVamas(readFixture('cellulose_fitted_following_briggs'));

  expect(spectra.map((spectrum) => spectrum.components.length)).toStrictEqual([
    0, 4, 2, 0,
  ]);
  expect(spectra[1]?.components[0]).toStrictEqual({
    id: 'component-0',
    label: 'C 1s 1',
    bindingEnergy: 286.7736,
    kineticEnergy: 1199.8264,
    area: 4830.0138,
    fwhm: 1.1057933,
    shape: 'lorentzianAsymmetric',
    relativeSensitivityFactor: 0.278,
    atomicMass: 12.011,
    regionId: 'region-0',
  });
  expect(spectra[2]?.components[1]?.label).toBe('O 1s 1');
  expect(spectra[2]?.components[1]?.area).toBe(8068.9509);
});

test('a region is stored low bound first, whichever way the file wrote it', () => {
  const spectra = readVamas(readFixture('cellulose_fitted_following_briggs'));
  const region = spectra[1]?.regions[0];

  expect(spectra.map((spectrum) => spectrum.regions.length)).toStrictEqual([
    0, 1, 1, 0,
  ]);
  expect(region?.id).toBe('region-0');
  expect(region?.label).toBe('C 1s');
  expect(region?.backgroundType).toBe('Shirley');
  expect(region?.from).toBeCloseTo(283.3484, 6);
  expect(region?.to).toBeCloseTo(293.2871, 6);
  expect(region?.relativeSensitivityFactor).toBe(0.278);
  expect(region?.atomicMass).toBe(12.011);
});

test('a block with a region and no fit carries the region alone', () => {
  const spectra = readVamas(readFixture('pegCASA'));

  expect(spectra[1]?.transition.name).toBe('C 1s');
  expect(spectra[1]?.regions).toHaveLength(1);
  expect(spectra[1]?.components).toStrictEqual([]);
});

test('a file that states no photon energy stays on the kinetic axis', () => {
  const spectra = readVamas(readFixture('auger'));

  expect(spectra).toHaveLength(4);

  for (const spectrum of spectra) {
    expect(spectrum.sourceEnergy).toBeNull();
    expect(spectrum.kinetic).toBeNull();
  }

  expect(spectra[1]?.energy.x).toHaveLength(501);
  expect(spectra[1]?.energy.x[0]).toBe(200);
  expect(spectra[1]?.energy.x.at(-1)).toBe(300);
  expect(spectra[1]?.energy.y[0]).toBe(252397);
  expect(spectra[1]?.meta?.sourceEnergy).toBeNull();
  expect(spectra[1]?.meta?.fields.map((field) => field.label)).not.toContain(
    'Take-off angle',
  );
  expect(spectra[2]?.transition).toStrictEqual({
    name: 'O KLL',
    element: null,
    shell: null,
    angularMomentum: null,
    augerElement: 'O',
    augerTransition: 'KLL',
  });
});

test('a file measured in kinetic energy keeps the axis the file converted', () => {
  const spectra = readVamas(readFixture('multiplex'));

  expect(spectra).toHaveLength(3);
  expect(spectra[0]?.sourceEnergy).toBe(1486.69);
  expect(spectra[0]?.energy.x).toHaveLength(1206);
  expect(spectra[0]?.energy.x[0]).toBe(-5);
  expect(spectra[0]?.energy.x.at(-1)).toBe(1200);
  expect(spectra[0]?.kinetic?.x[0]).toBe(1491.69);
  expect(spectra[0]?.kinetic?.x.at(-1)).toBe(286.69);
  expect(spectra[0]?.kinetic?.y).toBe(spectra[0]?.energy.y);
});

test('an experiment of several samples names every block by its sample', () => {
  const spectra = readVamas(readFixture('assigned'), { idPrefix: 'assigned' });
  const samples = new Set<string | undefined>();
  for (const spectrum of spectra) samples.add(spectrum.origin.sampleId);

  expect(spectra).toHaveLength(54);
  expect([...samples]).toStrictEqual([
    'RW_WS2_MoS2_thicker',
    'RW_WS2',
    'RW_Tha_MoS2',
    'RW_sonic_MoS2',
    'RW_WS2_MoS2',
    'RW_Nb_MoS2',
  ]);
  expect(spectra[5]?.name).toBe('RW_WS2_MoS2_thicker — Mo 3d');
  expect(spectra[5]?.transition.element).toBe('Mo');
  expect(spectra[5]?.transition.shell).toBe(3);
});

test('two components of one doublet share a label and never an identity', () => {
  const spectra = readVamas(readFixture('assigned'));
  const components = spectra[5]?.components ?? [];

  expect(components).toHaveLength(10);
  expect(components[0]?.label).toBe('Mo 3d MoS2 2H');
  expect(components[1]?.label).toBe('Mo 3d MoS2 2H');
  expect(components[0]?.id).toBe('component-0');
  expect(components[1]?.id).toBe('component-1');
  expect(components[1]?.bindingEnergy).toBeCloseTo(232.61, 6);
  expect(components[1]?.kineticEnergy).toBe(1254.08);
  expect(components[1]?.relativeSensitivityFactor).toBe(10.804667);
  expect(components[1]?.regionId).toBe('region-0');
});

test('the acquisition table holds every record the file populated', () => {
  const spectra = readVamas(readFixture('cellulose_fitted_following_briggs'));
  const meta = spectra[1]?.meta;

  expect(meta?.title).toBe('Cellulose');
  expect(meta?.sourceLabel).toBe('Al Ka, Monochromated');
  expect(meta?.sourceEnergy).toBe(1486.6);
  expect(meta?.passEnergy).toBe(150);
  expect(meta?.fields.map((field) => field.label)).toStrictEqual([
    'Technique',
    'Source',
    'Photon energy',
    'Analyser mode',
    'Pass energy',
    'Scans',
    'Dwell time',
    'Take-off angle',
    'Instrument',
    'Operator',
    'Institution',
    'Sample',
    'Acquired',
    'Points',
    'Step',
  ]);
});

test('colours are handed out around the ones already on the chart', () => {
  const file = readFixture('cellulose_fitted_following_briggs');
  const [first, second, third, fourth, fifth] = SPECTRUM_COLORS;

  // Read off the palette rather than written out, so this pins the rule — the
  // lowest colour not already taken — instead of pinning the six hues, which
  // are a design choice and have been changed once already.
  expect(readVamas(file).map((spectrum) => spectrum.color)).toStrictEqual([
    first,
    second,
    third,
    fourth,
  ]);
  expect(
    readVamas(file, { taken: [first as string] }).map(
      (spectrum) => spectrum.color,
    ),
  ).toStrictEqual([second, third, fourth, fifth]);
});

test('a file that is not VAMAS is refused by name', () => {
  expect(() =>
    readVamas('nothing to read here', { fileName: 'broken.vms' }),
  ).toThrow(/"broken\.vms" could not be read as VAMAS/);
});
