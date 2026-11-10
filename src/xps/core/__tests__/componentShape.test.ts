import { expect, test } from 'vitest';

import {
  DEFAULT_LORENTZIAN_FRACTION,
  GAUSSIAN_INTEGRAL,
  LORENTZIAN_INTEGRAL,
  parseComponentShape,
  shapeValue,
} from '../componentShape.ts';

test('the two integrals are the ones the maths says', () => {
  expect(GAUSSIAN_INTEGRAL).toBe(1.0644670194312262);
  expect(LORENTZIAN_INTEGRAL).toBe(1.5707963267948966);
  expect(DEFAULT_LORENTZIAN_FRACTION).toBe(0.3);
});

test('the number in GL(n) is the percentage of Lorentzian', () => {
  expect(parseComponentShape('GL(30)')).toStrictEqual({
    kind: 'pseudoVoigt',
    lorentzianFraction: 0.3,
    lowExponent: 1,
    highExponent: 1,
    integral: 1.2163658116403273,
  });
});

test('the ends of the GL scale are the two families themselves', () => {
  expect(parseComponentShape('GL(0)')).toStrictEqual({
    kind: 'gaussian',
    lorentzianFraction: 0,
    lowExponent: 1,
    highExponent: 1,
    integral: GAUSSIAN_INTEGRAL,
  });
  expect(parseComponentShape('GL(100)')).toStrictEqual({
    kind: 'lorentzian',
    lorentzianFraction: 1,
    lowExponent: 1,
    highExponent: 1,
    integral: LORENTZIAN_INTEGRAL,
  });
});

test('the sum and the product forms are drawn as the same mixture', () => {
  expect(parseComponentShape('SGL(30)')).toStrictEqual(
    parseComponentShape('GL(30)'),
  );
});

test('the families can also be named in words, in any case', () => {
  expect(parseComponentShape('Gaussian').kind).toBe('gaussian');
  expect(parseComponentShape('lorentzian').kind).toBe('lorentzian');
  expect(parseComponentShape('gaussianLorentzian').lorentzianFraction).toBe(
    0.3,
  );
});

test('an asymmetric Lorentzian keeps a flank exponent either side', () => {
  const shape = parseComponentShape('LA(1.53, 243, 25)');

  expect(shape.kind).toBe('asymmetric');
  expect(shape.lowExponent).toBe(1.53);
  expect(shape.highExponent).toBe(243);
  expect(shape.integral).toBeCloseTo(0.51947, 4);
});

test('one exponent is used on both flanks when only one is stated', () => {
  const shape = parseComponentShape('LA(2)');

  expect(shape.lowExponent).toBe(2);
  expect(shape.highExponent).toBe(2);
});

test('an asymmetric shape with no exponents is the Lorentzian it reduces to', () => {
  const shape = parseComponentShape('lorentzianAsymmetric');

  expect(shape.kind).toBe('asymmetric');
  expect(shape.lowExponent).toBe(1);
  expect(shape.highExponent).toBe(1);
  // Truncated at forty widths, so a hair short of the exact pi / 2.
  expect(shape.integral).toBeCloseTo(1.55829, 4);
});

test('a shape nobody recognises is drawn rather than skipped', () => {
  const shape = parseComponentShape('Voigt-ish, hand written');

  expect(shape.kind).toBe('pseudoVoigt');
  expect(shape.lorentzianFraction).toBe(DEFAULT_LORENTZIAN_FRACTION);
});

test('a percentage outside the scale is pulled back onto it', () => {
  expect(parseComponentShape('GL(-20)').lorentzianFraction).toBe(0);
  expect(parseComponentShape('GL(500)').lorentzianFraction).toBe(1);
  expect(parseComponentShape('GL()').lorentzianFraction).toBe(0.3);
});

test('every family is one at its own centre and a half at its own width', () => {
  const shapes = ['GL(0)', 'GL(30)', 'GL(100)', 'LA(1, 1)'];
  for (const name of shapes) {
    const shape = parseComponentShape(name);

    expect(shapeValue(shape, 0)).toBe(1);
    expect(shapeValue(shape, 0.5)).toBeCloseTo(0.5, 12);
    expect(shapeValue(shape, -0.5)).toBeCloseTo(0.5, 12);
  }
});

test('a Lorentzian keeps far more of itself out in the tails', () => {
  const gaussian = parseComponentShape('GL(0)');
  const lorentzian = parseComponentShape('GL(100)');

  expect(shapeValue(gaussian, 3)).toBeCloseTo(1.4552e-11, 15);
  expect(shapeValue(lorentzian, 3)).toBeCloseTo(0.027027, 6);
});

test('an asymmetric shape falls away faster on the flank it is asked to', () => {
  const shape = parseComponentShape('LA(1, 4)');

  expect(shapeValue(shape, -1)).toBeCloseTo(0.2, 12);
  expect(shapeValue(shape, 1)).toBeCloseTo(0.0016, 12);
});

test('a distance that is not one draws nothing', () => {
  expect(shapeValue(parseComponentShape('GL(30)'), Number.NaN)).toBe(0);
});
