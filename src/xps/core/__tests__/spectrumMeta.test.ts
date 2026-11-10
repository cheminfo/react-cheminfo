import { expect, test } from 'vitest';
import type { NormalisedMeta } from 'xps-analysis';

import { buildXpsMeta } from '../spectrumMeta.ts';

const PASS_ENERGY = 'analyser pass energy or retard ratio or mass resolution';

test('the table reads in the order a method is read in', () => {
  const meta = buildXpsMeta({
    record: {
      technique: 'XPS',
      'analysis source label': 'Al Ka, Monochromated',
      'analysis source characteristic energy': 1486.6,
      'analyser mode': 'FAT',
      [PASS_ENERGY]: 150,
      'number of scans to compile this block': 25,
      'signal collection time': 0.1,
      'analyser axis take off polar angle': 45,
      'instrument model identifier': 'Scienta ESCA300',
      'operator identifier': 'G Beamson',
      'institution identifier': 'SurfaceSpectra Ltd.',
      'sample identifier': 'Cellulose',
      'year in full': 2000,
      month: 3,
      'day of month': 1,
      hours: 1,
      minutes: 0,
      seconds: 0,
      'abscissa increment': -0.05,
      'abscissa units': 'eV',
    },
    points: 241,
  });

  expect(meta?.fields).toStrictEqual([
    { label: 'Technique', value: 'XPS' },
    { label: 'Source', value: 'Al Ka, Monochromated' },
    { label: 'Photon energy', value: '1486.60 eV' },
    { label: 'Analyser mode', value: 'FAT' },
    { label: 'Pass energy', value: '150 eV' },
    { label: 'Scans', value: '25' },
    { label: 'Dwell time', value: '0.1 s' },
    { label: 'Take-off angle', value: '45°' },
    { label: 'Instrument', value: 'Scienta ESCA300' },
    { label: 'Operator', value: 'G Beamson' },
    { label: 'Institution', value: 'SurfaceSpectra Ltd.' },
    { label: 'Sample', value: 'Cellulose' },
    { label: 'Acquired', value: '2000-03-01 01:00:00' },
    { label: 'Points', value: '241' },
    { label: 'Step', value: '0.05 eV' },
  ]);
});

test('a record the standard fills with a placeholder is no answer at all', () => {
  const meta = buildXpsMeta({
    record: {
      technique: 'XPS',
      'analysis source label': 'Not specified',
      'analysis source characteristic energy': 0,
      'analyser axis take off polar angle': 1e37,
      'institution identifier': 'Not specified',
      'sample identifier': 'PK_Cu_AES',
      'year in full': 1e37,
    },
  });

  expect(meta?.fields).toStrictEqual([
    { label: 'Technique', value: 'XPS' },
    { label: 'Sample', value: 'PK_Cu_AES' },
  ]);
  expect(meta?.sourceLabel).toBeNull();
  expect(meta?.sourceEnergy).toBeNull();
});

test('a retarding-ratio analyser states a ratio and not an energy', () => {
  const fixed = buildXpsMeta({
    record: { 'analyser mode': 'FAT', [PASS_ENERGY]: 20 },
  });

  expect(fixed?.fields).toStrictEqual([
    { label: 'Analyser mode', value: 'FAT' },
    { label: 'Pass energy', value: '20 eV' },
  ]);

  const retarding = buildXpsMeta({
    record: { 'analyser mode': 'FRR', [PASS_ENERGY]: 10 },
  });

  expect(retarding?.fields).toStrictEqual([
    { label: 'Analyser mode', value: 'FRR' },
    { label: 'Pass energy', value: '10' },
  ]);
  expect(retarding?.passEnergy).toBe(10);
});

test('the points the trace holds beat the ordinates the block counts', () => {
  const measured = buildXpsMeta({
    record: { nbOrdinateValues: 182 },
    points: 91,
  });

  expect(measured?.fields).toStrictEqual([{ label: 'Points', value: '91' }]);

  const counted = buildXpsMeta({ record: { nbOrdinateValues: 182 } });

  expect(counted?.fields).toStrictEqual([{ label: 'Points', value: '182' }]);
});

test('a dwell time is written to four decimals and a step as a width', () => {
  const meta = buildXpsMeta({
    record: {
      'signal collection time': 0.359281,
      'abscissa increment': -0.15,
      'abscissa units': 'eV',
    },
  });

  expect(meta?.fields).toStrictEqual([
    { label: 'Dwell time', value: '0.3593 s' },
    { label: 'Step', value: '0.15 eV' },
  ]);
});

test('the normalised view answers what the flat record does not', () => {
  const meta = buildXpsMeta({ normalised: normalisedMeta() });

  expect(meta?.fields).toStrictEqual([
    { label: 'Source', value: 'Al Ka, Monochromated' },
    { label: 'Photon energy', value: '1486.60 eV' },
    { label: 'Analyser mode', value: 'FAT' },
  ]);
  expect(meta?.sourceEnergy).toBe(1486.6);
  expect(meta?.analyserMode).toBe('FAT');
});

test('the experiment identifier titles a block the reader did not title', () => {
  const titled = buildXpsMeta({ title: 'Cellulose' });

  expect(titled?.title).toBe('Cellulose');
  expect(titled?.fields).toStrictEqual([]);

  const identified = buildXpsMeta({
    record: { 'experiment identifier': '20200210_TaO2_AC_test.experiment' },
  });

  expect(identified?.title).toBe('20200210_TaO2_AC_test.experiment');
});

test('a file that says nothing gets no table at all', () => {
  expect(buildXpsMeta({})).toBeNull();
  expect(
    buildXpsMeta({
      title: ' '.repeat(3),
      record: { 'institution identifier': 'Not specified' },
    }),
  ).toBeNull();
});

/**
 * A normalised view of a block that states nothing but its source.
 * @returns The view.
 */
function normalisedMeta(): NormalisedMeta {
  return {
    region: {
      name: 'C 1s',
      orbital: { element: 'C', shell: 1, angularMomentum: 's' },
      auger: { element: null, transition: null },
    },
    energyType: { kind: 'binding', units: 'eV' },
    analysisSource: {
      label: 'Al Ka, Monochromated',
      characteristicEnergy: { value: 1486.6, units: 'eV' },
      beamWidthX: { value: 6000, units: 'um' },
      beamWidthY: { value: 500, units: 'um' },
    },
    speciesLabel: 'C',
    components: [],
    regions: [],
    from: 294.16,
    to: 282.16,
    analyserMode: 'FAT',
  };
}
