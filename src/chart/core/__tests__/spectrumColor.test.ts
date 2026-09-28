import { expect, test } from 'vitest';

import {
  ALL_SPECTRUM_COLORS,
  EXTRA_SPECTRUM_COLORS,
  SPECTRUM_COLORS,
  nextSpectrumColor,
} from '../spectrumColor.ts';

test('the handed-out tier is the six that survive every deficiency', () => {
  expect(SPECTRUM_COLORS).toStrictEqual([
    '#0072b2',
    '#d55e00',
    '#009e73',
    '#cc79a7',
    '#e69f00',
    '#56b4e9',
  ]);
  expect(new Set(SPECTRUM_COLORS).size).toBe(6);
});

test('the offered tier is six more, none of them repeating the first', () => {
  expect(EXTRA_SPECTRUM_COLORS).toStrictEqual([
    '#000000',
    '#f0e442',
    '#ff8082',
    '#990099',
    '#804000',
    '#7f878f',
  ]);
  expect(new Set(ALL_SPECTRUM_COLORS).size).toBe(12);
});

test('a picker shows both tiers, the handed-out one first', () => {
  expect(ALL_SPECTRUM_COLORS).toStrictEqual([
    ...SPECTRUM_COLORS,
    ...EXTRA_SPECTRUM_COLORS,
  ]);
});

test('the first spectrum is drawn in the first hue', () => {
  expect(nextSpectrumColor([])).toBe('#0072b2');
});

test('hues are handed out in order while none has been given back', () => {
  expect(nextSpectrumColor(['#0072b2'])).toBe('#d55e00');
  expect(nextSpectrumColor(['#0072b2', '#d55e00'])).toBe('#009e73');
  expect(nextSpectrumColor(['#0072b2', '#d55e00', '#009e73'])).toBe('#cc79a7');
});

test('nothing is ever handed out of the offered tier', () => {
  const many = [...SPECTRUM_COLORS, ...SPECTRUM_COLORS, ...SPECTRUM_COLORS];

  for (const color of EXTRA_SPECTRUM_COLORS) {
    expect(nextSpectrumColor(many)).not.toBe(color);
  }

  expect(nextSpectrumColor(many)).toBe('#0072b2');
});

test('a spectrum drawn in an offered colour neither takes nor frees a hue', () => {
  expect(nextSpectrumColor(['#000000', '#0072b2'])).toBe('#d55e00');
});

test('a hue freed by a deleted spectrum is handed out again', () => {
  expect(nextSpectrumColor(['#0072b2', '#009e73'])).toBe('#d55e00');
});

test('the order the spectra are held in does not decide the hue', () => {
  expect(nextSpectrumColor(['#009e73', '#0072b2'])).toBe('#d55e00');
});

test('a colour from outside the palette takes no hue out of it', () => {
  expect(nextSpectrumColor(['#ffffff', 'rebeccapurple'])).toBe('#0072b2');
});

test('once every hue is taken the least-used one comes back', () => {
  const all = [...SPECTRUM_COLORS];

  expect(nextSpectrumColor(all)).toBe('#0072b2');
  expect(nextSpectrumColor([...all, '#0072b2'])).toBe('#d55e00');
  expect(nextSpectrumColor([...all, '#0072b2', '#d55e00'])).toBe('#009e73');
  expect(nextSpectrumColor([...all, ...all])).toBe('#0072b2');
});
