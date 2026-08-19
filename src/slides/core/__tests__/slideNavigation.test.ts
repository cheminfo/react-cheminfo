import { expect, test } from 'vitest';

import { clampSlideIndex, slideActionForKey } from '../slideNavigation.ts';

test('an index inside the talk is kept', () => {
  expect(clampSlideIndex(3, 10)).toBe(3);
});

test('a negative index, or one that is not a number, is the first slide', () => {
  expect(clampSlideIndex(-1, 10)).toBe(0);
  expect(clampSlideIndex(Number.NaN, 10)).toBe(0);
  expect(clampSlideIndex(Number.NEGATIVE_INFINITY, 10)).toBe(0);
});

test('an index past the end is the last slide', () => {
  expect(clampSlideIndex(12, 10)).toBe(9);
  expect(clampSlideIndex(Number.POSITIVE_INFINITY, 10)).toBe(9);
});

test('a talk with no slides is always the first slide', () => {
  expect(clampSlideIndex(4, 0)).toBe(0);
  expect(clampSlideIndex(0, Number.NaN)).toBe(0);
});

test('a fractional index is truncated to the slide it sits on', () => {
  expect(clampSlideIndex(2.7, 10)).toBe(2);
});

test('every forward key steps to the next slide', () => {
  for (const key of ['ArrowRight', 'ArrowDown', 'PageDown', ' ']) {
    expect(slideActionForKey(key, 3, 10)).toStrictEqual({
      kind: 'go',
      index: 4,
    });
  }
});

test('every backward key steps to the previous slide', () => {
  for (const key of ['ArrowLeft', 'ArrowUp', 'PageUp']) {
    expect(slideActionForKey(key, 3, 10)).toStrictEqual({
      kind: 'go',
      index: 2,
    });
  }
});

test('stepping past the last slide stays on it', () => {
  expect(slideActionForKey('ArrowRight', 9, 10)).toStrictEqual({
    kind: 'go',
    index: 9,
  });
});

test('stepping back from the first slide stays on it', () => {
  expect(slideActionForKey('ArrowLeft', 0, 10)).toStrictEqual({
    kind: 'go',
    index: 0,
  });
});

test('Home and End go to the ends of the talk', () => {
  expect(slideActionForKey('Home', 5, 10)).toStrictEqual({
    kind: 'go',
    index: 0,
  });
  expect(slideActionForKey('End', 5, 10)).toStrictEqual({
    kind: 'go',
    index: 9,
  });
});

test('End on a talk with no slides is still the first slide', () => {
  expect(slideActionForKey('End', 0, 0)).toStrictEqual({
    kind: 'go',
    index: 0,
  });
});

test('f toggles fullscreen, in either case', () => {
  expect(slideActionForKey('f', 0, 10)).toStrictEqual({ kind: 'fullscreen' });
  expect(slideActionForKey('F', 0, 10)).toStrictEqual({ kind: 'fullscreen' });
});

test('b and w blank the screen', () => {
  expect(slideActionForKey('b', 0, 10)).toStrictEqual({
    kind: 'blank',
    color: 'black',
  });
  expect(slideActionForKey('W', 0, 10)).toStrictEqual({
    kind: 'blank',
    color: 'white',
  });
});

test('n shows the presenter notes', () => {
  expect(slideActionForKey('n', 0, 10)).toStrictEqual({ kind: 'notes' });
  expect(slideActionForKey('N', 0, 10)).toStrictEqual({ kind: 'notes' });
});

test('any other key means nothing', () => {
  expect(slideActionForKey('q', 0, 10)).toBeNull();
  expect(slideActionForKey('Enter', 0, 10)).toBeNull();
  expect(slideActionForKey('', 0, 10)).toBeNull();
});
