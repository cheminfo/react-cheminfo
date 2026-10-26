import { expect, test } from 'vitest';

import { parseScanFilter } from '../scanFilter.ts';

const exploris = [
  'SPECTRUM - MS',
  'Caffeine_MS2_HCD50.raw',
  'FTMS + p NSI Full ms2 195.5000@hcd50.00 [44.2900-221.4500]',
  'Scan #: 1',
  'RT: 1.54',
  'Data points: 10551',
].join('\n');

test('a whole Exploris conditions block is read', () => {
  expect(parseScanFilter(exploris)).toStrictEqual({
    Analyser: 'FTMS',
    Ionization: 'NSI',
    Polarity: 'positive',
    'MS level': 'MS2',
    'Isolation m/z': '195.5000',
    'Collision energy': 'HCD 50.00',
    'Scan range': '44.29–221.45 m/z',
    'Retention time': '1.54 min',
    Scans: '1',
    'Raw file': 'Caffeine_MS2_HCD50.raw',
  });
});

test('a survey scan states its level and no collision energy', () => {
  const survey = 'ITMS - c ESI Full ms [150.0000-2000.0000]\nRT: 12.07';

  expect(parseScanFilter(survey)).toStrictEqual({
    Analyser: 'ITMS',
    Ionization: 'ESI',
    Polarity: 'negative',
    'MS level': 'MS1',
    'Scan range': '150–2000 m/z',
    'Retention time': '12.07 min',
  });
});

test('the level is stated even when the activation carries no energy', () => {
  const etd = 'FTMS + p NSI Full ms2 194.5000@etd [44.0860-220.4300]';

  expect(parseScanFilter(etd)).toStrictEqual({
    Analyser: 'FTMS',
    Ionization: 'NSI',
    Polarity: 'positive',
    'MS level': 'MS2',
    'Isolation m/z': '194.5000',
    'Scan range': '44.086–220.43 m/z',
  });
});

test('a narrow-window scan is a survey scan and an MS3 states its level', () => {
  const sim = 'FTMS + p NSI SIM ms [190.0000-200.0000]';

  expect(parseScanFilter(sim)['MS level']).toBe('MS1');

  const ms3 =
    'ITMS + c NSI Full ms3 400.00@cid35.00 210.00@cid30.00 [55.00-420.00]';
  const derived = parseScanFilter(ms3);

  expect(derived['MS level']).toBe('MS3');
  expect(derived['Isolation m/z']).toBe('400.00');
  expect(derived['Collision energy']).toBe('CID 35.00');
});

test('the polarity is read beside the analyser, not off a stray minus sign', () => {
  const range = 'Full ms [44.2900-221.4500]';

  expect(parseScanFilter(range).Polarity).toBeUndefined();
});

test('a block that states nothing derives nothing', () => {
  expect(parseScanFilter('')).toStrictEqual({});
  expect(parseScanFilter('SPECTRUM - MS\nData points: 10551')).toStrictEqual(
    {},
  );
});
