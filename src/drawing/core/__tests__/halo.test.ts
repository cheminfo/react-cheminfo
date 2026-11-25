import { expect, test } from 'vitest';

import { HALO, haloStrokeWidth, haloText } from '../halo.ts';

test('a stroke stands on a dark halo half its width wide on each side, at least half a pixel', () => {
  expect(haloStrokeWidth(2)).toBe(4);
  expect(haloStrokeWidth(0.5)).toBe(1.5);
  expect(HALO).toStrictEqual({
    dark: '#000000',
    light: '#ffffff',
    opacity: 0.6,
  });
});

test('text stands on the ink it stands out from, a sixth of its size wide', () => {
  expect(haloText('#ffffff', 24)).toStrictEqual({
    stroke: '#000000',
    strokeOpacity: 0.6,
    strokeWidth: 4,
  });
  expect(haloText('#0000ff', 3)).toStrictEqual({
    stroke: '#ffffff',
    strokeOpacity: 0.6,
    strokeWidth: 1,
  });
});
