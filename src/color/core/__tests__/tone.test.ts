import { expect, test } from 'vitest';

import { scaleTone, setScaleTone } from '../tone.ts';

const STOPS = [
  { position: 0, color: '#ff0000' },
  { position: 0.5, color: '#808080' },
  { position: 1, color: '#004000' },
];

test('the tone of a scale is the mean over its anchors', () => {
  const tone = scaleTone(STOPS);

  expect(tone.saturation).toBeCloseTo(2 / 3, 10);
  expect(tone.value).toBeCloseTo((1 + 128 / 255 + 64 / 255) / 3, 10);
  expect(scaleTone([])).toStrictEqual({ saturation: 0, value: 0 });
});

test('setting the tone keeps every hue, and a grey takes its neighbour’s', () => {
  expect(setScaleTone(STOPS, { saturation: 1, value: 1 })).toStrictEqual([
    { position: 0, color: '#ff0000' },
    { position: 0.5, color: '#ff0000' },
    { position: 1, color: '#00ff00' },
  ]);
});

test('a field left out keeps each anchor’s own', () => {
  expect(setScaleTone(STOPS, { value: 0.5 })).toStrictEqual([
    { position: 0, color: '#800000' },
    { position: 0.5, color: '#808080' },
    { position: 1, color: '#008000' },
  ]);
});
