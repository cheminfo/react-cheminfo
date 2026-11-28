import { expect, test } from 'vitest';

import { SLIDE_PARAM, slideParam, withSlideParam } from '../slideAddress.ts';

const SLIDE = slideParam();

test('the parameter is named slide', () => {
  expect(SLIDE_PARAM).toBe('slide');
});

test('the slide an address names is counted from one', () => {
  expect(SLIDE.parse('6')).toBe(5);
  expect(SLIDE.parse('7')).toBe(6);
  expect(SLIDE.parse('2')).toBe(1);
  expect(SLIDE.parse('1')).toBe(0);
  expect(SLIDE.parse(undefined)).toBe(0);
  expect(SLIDE.parse(null)).toBe(0);
});

test('a slide number that means nothing opens the talk at its first slide', () => {
  for (const value of ['', '0', '-3', '-4', 'six', 'seven', 'later']) {
    expect(SLIDE.parse(value)).toBe(0);
  }
});

test('a number past the end is left for the player to clamp', () => {
  expect(SLIDE.parse('400')).toBe(399);
});

test('the first slide writes nothing, the others their number from one', () => {
  expect(SLIDE.serialize(0)).toBeNull();
  expect(SLIDE.serialize(-2)).toBeNull();
  expect(SLIDE.serialize(1)).toBe('2');
  expect(SLIDE.serialize(6)).toBe('7');
  expect(SLIDE.serialize(Number.NaN)).toBeNull();
});

test('a slide survives the round trip through the address', () => {
  for (const index of [0, 1, 5, 17]) {
    expect(SLIDE.parse(SLIDE.serialize(index))).toBe(index);
  }
});

test('the first slide is written as a plain address, the rest carry theirs', () => {
  expect(withSlideParam('/slides/a-deck', 0)).toBe('/slides/a-deck');
  expect(withSlideParam('/slides/a-deck', 1)).toBe('/slides/a-deck?slide=2');
  expect(withSlideParam('/slides/smiles/rings', 6)).toBe(
    '/slides/smiles/rings?slide=7',
  );
  expect(withSlideParam('/talks/a?embed=1', 2)).toBe(
    '/talks/a?embed=1&slide=3',
  );
});
