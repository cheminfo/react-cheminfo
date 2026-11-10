import { expect, test } from 'vitest';

import {
  UNNAMED_SAMPLE_LABEL,
  countVisible,
  findSpectrum,
  groupSpectraBySample,
  hasSampleGroups,
} from '../spectrumGroups.ts';

import { spectrumFixture } from './panelFixture.ts';

test('the blocks of one experiment are grouped by the sample they were measured on', () => {
  const groups = groupSpectraBySample([
    spectrumFixture('a-survey', { sampleId: 'A', transitionName: 'Survey' }),
    spectrumFixture('b-survey', { sampleId: 'B', transitionName: 'Survey' }),
    spectrumFixture('a-carbon', { sampleId: 'A', transitionName: 'C 1s' }),
  ]);

  expect(groups).toHaveLength(2);
  expect(groups[0]?.id).toBe('A');
  expect(groups[0]?.label).toBe('A');
  expect(groups[0]?.spectra.map((spectrum) => spectrum.id)).toStrictEqual([
    'a-survey',
    'a-carbon',
  ]);
  expect(groups[1]?.spectra.map((spectrum) => spectrum.id)).toStrictEqual([
    'b-survey',
  ]);
});

test('a sample keeps the place its first block gave it', () => {
  const groups = groupSpectraBySample([
    spectrumFixture('second', { sampleId: 'Z' }),
    spectrumFixture('first', { sampleId: 'A' }),
    spectrumFixture('third', { sampleId: 'Z' }),
  ]);

  expect(groups.map((group) => group.id)).toStrictEqual(['Z', 'A']);
});

test('a file that names no sample gives one unnamed group', () => {
  const groups = groupSpectraBySample([
    spectrumFixture('one'),
    spectrumFixture('two'),
  ]);

  expect(groups).toHaveLength(1);
  expect(groups[0]?.id).toBe('');
  expect(groups[0]?.label).toBe(UNNAMED_SAMPLE_LABEL);
  expect(groups[0]?.spectra).toHaveLength(2);
  expect(hasSampleGroups(groups)).toBe(false);
});

test('named and unnamed blocks stay in separate groups', () => {
  const groups = groupSpectraBySample([
    spectrumFixture('named', { sampleId: 'A' }),
    spectrumFixture('unnamed'),
  ]);

  expect(groups.map((group) => group.id)).toStrictEqual(['A', '']);
  expect(hasSampleGroups(groups)).toBe(true);
});

test('nothing loaded is no groups at all', () => {
  expect(groupSpectraBySample([])).toStrictEqual([]);
  expect(hasSampleGroups([])).toBe(false);
});

test('a spectrum is found by its identity and never by its place', () => {
  const spectra = [spectrumFixture('first'), spectrumFixture('second')];

  expect(findSpectrum(spectra, 'second')?.id).toBe('second');
  expect(findSpectrum(spectra, 'missing')).toBeNull();
  expect(findSpectrum(spectra, null)).toBeNull();
  expect(findSpectrum([], 'first')).toBeNull();
});

test('how many are drawn counts the visible ones only', () => {
  const spectra = [
    spectrumFixture('drawn'),
    spectrumFixture('hidden', { visible: false }),
    spectrumFixture('also-drawn'),
  ];

  expect(countVisible(spectra)).toBe(2);
  expect(countVisible([])).toBe(0);
});
