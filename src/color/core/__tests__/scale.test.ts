import { expect, test } from 'vitest';

import { relativeLuminance } from '../contrast.ts';
import {
  VIRIDIS_SCALE,
  colorFromScale,
  positionInRange,
  swatchFromScale,
} from '../scale.ts';

test('a value is placed where it sits between the bounds', () => {
  expect(positionInRange(0, 0, 10)).toBe(0);
  expect(positionInRange(5, 0, 10)).toBe(0.5);
  expect(positionInRange(10, 0, 10)).toBe(1);
});

test('a value outside the bounds is clamped rather than running off the scale', () => {
  expect(positionInRange(50, 0, 10)).toBe(1);
  expect(positionInRange(-5, 0, 10)).toBe(0);
});

test('a range holding a single value puts everything in the middle', () => {
  expect(positionInRange(3, 3, 3)).toBe(0.5);
  expect(positionInRange(3, 3, 3, { logarithmic: true })).toBe(0.5);
});

test('a number that is not finite is placed at the bottom', () => {
  expect(positionInRange(Number.NaN, 0, 10)).toBe(0);
  expect(positionInRange(5, Number.NaN, 10)).toBe(0);
  expect(positionInRange(5, 0, Number.POSITIVE_INFINITY)).toBe(0);
});

test('a quantity spanning decades is placed logarithmically', () => {
  expect(positionInRange(0.01, 0.000_1, 1, { logarithmic: true })).toBeCloseTo(
    0.5,
    10,
  );
  expect(positionInRange(0.01, 0.000_1, 1)).toBeCloseTo(0.0099, 4);
});

test('a genuine zero on a logarithmic scale lands at the bottom, not off it', () => {
  expect(positionInRange(0, 0, 1000, { logarithmic: true })).toBe(0);
});

test('the scale runs from its first stop to its last', () => {
  expect(colorFromScale(VIRIDIS_SCALE, 0)).toBe('#440154');
  expect(colorFromScale(VIRIDIS_SCALE, 1)).toBe('#b4de2c');
  expect(colorFromScale(VIRIDIS_SCALE, -5)).toBe('#440154');
  expect(colorFromScale(VIRIDIS_SCALE, 5)).toBe('#b4de2c');
  expect(colorFromScale(VIRIDIS_SCALE, Number.NaN)).toBe('#440154');
});

test('a position between two stops is the mix of them', () => {
  expect(colorFromScale(['#000000', '#ffffff'], 0.5)).toBe('#808080');
  expect(colorFromScale(['#000000', '#ffffff'], 0.25)).toBe('#404040');
  expect(colorFromScale(['#000', '#fff'], 0.5)).toBe('#808080');
  expect(colorFromScale(['#000000', '#808080', '#ffffff'], 0.25)).toBe(
    '#404040',
  );
});

test('a scale of one stop is that stop everywhere', () => {
  expect(colorFromScale(['#2563eb'], 0)).toBe('#2563eb');
  expect(colorFromScale(['#2563eb'], 1)).toBe('#2563eb');
});

test('viridis is monotone in lightness, so it prints in greyscale', () => {
  let previous = -1;
  for (let step = 0; step <= 20; step++) {
    const lightness = relativeLuminance(
      colorFromScale(VIRIDIS_SCALE, step / 20),
    );

    expect(lightness).toBeGreaterThan(previous);

    previous = lightness;
  }
});

test('a swatch carries the colour and the ink that reads on it', () => {
  expect(swatchFromScale(VIRIDIS_SCALE, 0)).toStrictEqual({
    background: '#440154',
    foreground: '#ffffff',
  });
  expect(swatchFromScale(VIRIDIS_SCALE, 1)).toStrictEqual({
    background: '#b4de2c',
    foreground: '#182026',
  });
});

test('a scale with no stops throws rather than drawing nothing', () => {
  expect(() => colorFromScale([], 0.5)).toThrow(
    'a colour scale needs at least one stop',
  );
  expect(() => swatchFromScale([], 0.5)).toThrow(
    'a colour scale needs at least one stop',
  );
});

test('a stop that is not a hex colour throws, naming it', () => {
  expect(() => colorFromScale(['#000000', 'chartreuse'], 1)).toThrow(
    'not a hex colour: chartreuse',
  );
});
