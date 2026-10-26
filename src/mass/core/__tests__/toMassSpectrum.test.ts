import { expect, test } from 'vitest';

import { SPECTRUM_COLORS } from '../../../chart/core/spectrumColor.ts';
import { analyseSpectrum } from '../analyseSpectrum.ts';

import { massFixture } from './massFixtures.ts';

test('a profile is peak picked, and its resolving power measured', async () => {
  const [taxine] = await massFixture('taxine-b-ms2.jdx');

  expect(taxine?.profile?.x).toHaveLength(147);
  expect(taxine?.centroid.x).toHaveLength(10);
  expect(taxine?.centroid.x[0]).toBeCloseTo(71.4512, 4);
  expect(taxine?.centroid.x[7]).toBeCloseTo(194.1175, 4);
  expect(taxine?.showProfile).toBe(true);
  expect(taxine?.showCentroid).toBe(false);
  expect(taxine?.resolution?.kind).toBe('high');
  expect(taxine?.resolution?.basis).toBe('peakWidth');
  expect(Math.round(taxine?.resolution?.resolvingPower ?? 0)).toBe(15_615);
});

test('a peak table is taken as it stands, on a scale of 100', async () => {
  const [aflatoxin] = await massFixture('aflatoxin-peaks.jdx');

  expect(aflatoxin?.profile).toBeNull();
  expect(aflatoxin?.centroid.x).toHaveLength(23);
  expect(aflatoxin?.centroid.x[21]).toBe(330);
  expect(aflatoxin?.centroid.y[21]).toBe(100);
  expect(aflatoxin?.centroid.y[22]).toBeCloseTo(20.2, 10);
  expect(aflatoxin?.showProfile).toBe(false);
  expect(aflatoxin?.showCentroid).toBe(true);
  expect(aflatoxin?.resolution).toStrictEqual({
    kind: 'nominal',
    resolvingPower: null,
    basis: 'decimals',
    decimals: 0,
  });
});

test('every spectrum of a file is drawn in a colour of its own', async () => {
  const pages = await massFixture('gcms-ntuples.jdx');

  expect(pages.map((spectrum) => spectrum.color)).toStrictEqual(
    SPECTRUM_COLORS.slice(0, 3),
  );

  const [added] = await massFixture('caffeine-peaks.txt', [
    SPECTRUM_COLORS[0] as string,
  ]);

  expect(added?.color).toBe(SPECTRUM_COLORS[1]);
  expect(added?.name).toBe('caffeine-peaks.txt');
});

test('the file saying it is a profile overrides the spacing of its points', () => {
  const trace = {
    x: Float64Array.from([100, 101, 102, 103, 104]),
    y: Float64Array.from([1, 5, 9, 5, 1]),
  };

  expect(analyseSpectrum(trace).profile).toBeNull();
  expect(analyseSpectrum(trace).centroid.x).toHaveLength(5);
  expect(analyseSpectrum(trace, { continuous: true }).profile).not.toBeNull();
});

test('nothing to analyse is an empty spectrum, and a ragged one is refused', () => {
  const empty = analyseSpectrum({
    x: new Float64Array(0),
    y: new Float64Array(0),
  });

  expect(empty.profile).toBeNull();
  expect(empty.centroid.x).toHaveLength(0);
  expect(empty.resolution).toBeNull();

  expect(() =>
    analyseSpectrum({
      x: Float64Array.from([1, 2]),
      y: Float64Array.from([1]),
    }),
  ).toThrow('The trace carries 2 masses but 1 intensities');
});
