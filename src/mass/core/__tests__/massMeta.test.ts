import { expect, test } from 'vitest';

import { buildMassMeta } from '../massMeta.ts';

test('a field takes the first record that holds anything', () => {
  const meta = buildMassMeta({
    meta: { IONISATION: '', IONIZATION: 'APCI', COLLISIONENERGY: '' },
  });

  expect(meta?.fields).toStrictEqual([{ label: 'Ionization', value: 'APCI' }]);
});

test('a field reads the bag it belongs to and no other', () => {
  const meta = buildMassMeta({
    info: { ORIGIN: 'Mass spectrometry platform', INSTRUMENT: 'ignored' },
    meta: { INSTRUMENT: 'Exploris 240' },
  });

  expect(meta?.fields).toStrictEqual([
    { label: 'Source', value: 'Mass spectrometry platform' },
    { label: 'Instrument', value: 'Exploris 240' },
  ]);
});

test('the scan filter fills only the fields the records left blank', () => {
  const meta = buildMassMeta({
    meta: {
      ANALYZER: 'LTQ-Orbitrap',
      IONISATION: '',
      MODE: '',
      CONDITIONS:
        'FTMS - p ESI Full ms2 195.5000@hcd50.00 [44.2900-221.4500]\nRT: 1.54',
    },
  });

  expect(meta?.fields).toStrictEqual([
    { label: 'Analyser', value: 'LTQ-Orbitrap' },
    { label: 'Ionization', value: 'ESI' },
    { label: 'Polarity', value: 'negative' },
    { label: 'MS level', value: 'MS2' },
    { label: 'Isolation m/z', value: '195.5000' },
    { label: 'Collision energy', value: 'HCD 50.00' },
    { label: 'Scan range', value: '44.29–221.45 m/z' },
    { label: 'Retention time', value: '1.54 min' },
  ]);
});

test('a record read as a number is still shown as the file wrote it', () => {
  const meta = buildMassMeta({ meta: { SCANS: 1, ISOLATION: 194.5 } });

  expect(meta?.fields).toStrictEqual([
    { label: 'Isolation m/z', value: '194.5' },
    { label: 'Scans', value: '1' },
  ]);
});

test('the title is taken from the reader before the records', () => {
  const meta = buildMassMeta({
    title: 'Exploris_240 - MDMA 1',
    info: { TITLE: 'stale', MOLFORM: 'C11H15NO2' },
  });

  expect(meta?.title).toBe('Exploris_240 - MDMA 1');
  expect(meta?.molecularFormula).toBe('C11H15NO2');
});

test('the accurate-mass record answers for the formula the standard bag lost', () => {
  const meta = buildMassMeta({
    meta: { ACCURATE_MF: 'C8H10N4O2', INSTRUMENT: 'Exploris 240' },
  });

  expect(meta?.molecularFormula).toBe('C8H10N4O2');
});

test('a file that states only a formula still states something', () => {
  expect(buildMassMeta({ info: { MOLFORM: 'C11H15NO2' } })).toStrictEqual({
    title: null,
    molecularFormula: 'C11H15NO2',
    fields: [],
    conditions: null,
  });
});

test('a file that says nothing gets no table at all', () => {
  expect(buildMassMeta({})).toBeNull();
  expect(
    buildMassMeta({ title: ' '.repeat(3), meta: { NOTE: '' } }),
  ).toBeNull();
  expect(buildMassMeta({ meta: { 'Info 1': 'm/z intensity' } })).toBeNull();
});
