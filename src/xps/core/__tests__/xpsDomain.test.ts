import { expect, test } from 'vitest';

import { Y_DOMAIN_HEADROOM, fullDomain } from '../xpsDomain.ts';
import { DEFAULT_SETTINGS } from '../xpsState.ts';

import { spectrumFixture } from './spectrumFixture.ts';

const normalised = { ...DEFAULT_SETTINGS, normalise: true };
const kinetic = { ...DEFAULT_SETTINGS, energyAxis: 'kinetic' } as const;

test('the window runs edge to edge with room above the tallest peak', () => {
  expect(fullDomain([spectrumFixture('a')], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 290],
    y: [0, 550],
  });
  expect(Y_DOMAIN_HEADROOM).toBe(1.1);
});

test('two spectra are covered together', () => {
  const first = spectrumFixture('a');
  const second = spectrumFixture('b', {
    energy: [520, 530, 540],
    counts: [50, 1000, 80],
  });

  expect(fullDomain([first, second], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 540],
    y: [0, 1100],
  });
});

test('the kinetic axis fits the window it is actually drawn in', () => {
  expect(fullDomain([spectrumFixture('a')], kinetic)).toStrictEqual({
    x: [710, 720],
    y: [0, 550],
  });
});

test('a trace nobody asked to see does not move the axes', () => {
  const shown = spectrumFixture('a');
  const hidden = spectrumFixture('b', {
    energy: [0, 1200],
    counts: [10, 90000],
    visible: false,
  });

  expect(fullDomain([shown, hidden], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 290],
    y: [0, 550],
  });
});

test('a previewed reference is left out of the window', () => {
  const measured = spectrumFixture('a');
  const preview = spectrumFixture('preview', {
    energy: [0, 1200],
    counts: [10, 90000],
    excludeFromDomain: true,
  });

  expect(fullDomain([measured, preview], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 290],
    y: [0, 550],
  });
});

test('a previewed reference alone is shown rather than nothing', () => {
  const preview = spectrumFixture('preview', { excludeFromDomain: true });

  expect(fullDomain([preview], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 290],
    y: [0, 550],
  });
});

test('a normalised chart has a fixed counts window whatever it holds', () => {
  const faint = spectrumFixture('a', { counts: [1, 3, 2] });
  const strong = spectrumFixture('b', { counts: [1000, 90000, 2000] });

  expect(fullDomain([faint, strong], normalised)).toStrictEqual({
    x: [280, 290],
    y: [0, 110.00000000000001],
  });
});

test('a background-subtracted trace that dips below zero keeps its floor', () => {
  const subtracted = spectrumFixture('a', { counts: [-100, 500, 200] });

  expect(fullDomain([subtracted], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 290],
    y: [-100, 560],
  });
});

test('a spectrum of a single point is given a window to sit in', () => {
  const single = spectrumFixture('a', { energy: [284.8], counts: [500] });

  expect(fullDomain([single], DEFAULT_SETTINGS)).toStrictEqual({
    x: [283.8, 285.8],
    y: [0, 550],
  });
});

test('a spectrum of nothing but zeros keeps a usable counts axis', () => {
  const flat = spectrumFixture('a', { counts: [0, 0, 0] });

  expect(fullDomain([flat], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 290],
    y: [0, 1],
  });
});

test('a spectrum holding no point does not collapse the window', () => {
  const measured = spectrumFixture('a');
  const empty = spectrumFixture('b', { energy: [], counts: [] });

  expect(fullDomain([empty, measured], DEFAULT_SETTINGS)).toStrictEqual({
    x: [280, 290],
    y: [0, 550],
  });
  expect(fullDomain([empty], DEFAULT_SETTINGS)).toBeNull();
});

test('a chart with nothing drawn says so rather than inventing an axis', () => {
  expect(fullDomain([], DEFAULT_SETTINGS)).toBeNull();
  expect(
    fullDomain([spectrumFixture('a', { visible: false })], DEFAULT_SETTINGS),
  ).toBeNull();
});
