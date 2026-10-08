import { expect, test } from 'vitest';

import {
  UNIFORM_SWATCH,
  formatUniformColorScale,
  isUniformColorScale,
  uniformSwatch,
} from '../uniform.ts';

test('one colour is recognised however the link writes it', () => {
  expect(isUniformColorScale('uniform')).toBe(true);
  expect(isUniformColorScale(' Uniform ')).toBe(true);
  expect(isUniformColorScale('uniform-1c6e42')).toBe(true);
});

test('one colour names its colour, and the ink that reads on it', () => {
  expect(uniformSwatch('uniform-1c6e42')).toStrictEqual({
    background: '#1c6e42',
    foreground: '#ffffff',
  });
  expect(uniformSwatch('Uniform-FD0')).toStrictEqual({
    background: '#ffdd00',
    foreground: '#182026',
  });
});

test('one colour without a readable colour is the grey', () => {
  expect(uniformSwatch('uniform')).toBe(UNIFORM_SWATCH);
  expect(uniformSwatch('uniform-zz')).toBe(UNIFORM_SWATCH);
  expect(uniformSwatch('viridis')).toBe(UNIFORM_SWATCH);
});

test('one colour is written without its #', () => {
  expect(formatUniformColorScale('#1C6E42')).toBe('uniform-1c6e42');
  expect(formatUniformColorScale('not a colour')).toBe('uniform');
});

test('a scale, a custom scale and nothing are not one colour', () => {
  expect(isUniformColorScale('viridis')).toBe(false);
  expect(isUniformColorScale('hsv-long,0-0000ff,1-ff0000')).toBe(false);
  expect(isUniformColorScale(undefined)).toBe(false);
});
