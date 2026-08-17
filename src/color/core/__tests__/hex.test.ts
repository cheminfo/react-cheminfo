import { expect, test } from 'vitest';

import { parseHexColor, toHexColor } from '../hex.ts';

test('a six-digit colour reads as its three channels', () => {
  expect(parseHexColor('#440154')).toStrictEqual({
    red: 68,
    green: 1,
    blue: 84,
  });
  expect(parseHexColor('#FFFFFF')).toStrictEqual({
    red: 255,
    green: 255,
    blue: 255,
  });
});

test('a three-digit colour repeats each digit', () => {
  expect(parseHexColor('#fff')).toStrictEqual({
    red: 255,
    green: 255,
    blue: 255,
  });
  expect(parseHexColor('#08f')).toStrictEqual({
    red: 0,
    green: 136,
    blue: 255,
  });
});

test('anything that is not a hex colour throws, naming what was read', () => {
  expect(() => parseHexColor('rebeccapurple')).toThrow(
    'not a hex colour: rebeccapurple',
  );
  expect(() => parseHexColor('440154')).toThrow('not a hex colour: 440154');
  expect(() => parseHexColor('#4401')).toThrow('not a hex colour: #4401');
  expect(() => parseHexColor('#gggggg')).toThrow('not a hex colour: #gggggg');
  expect(() => parseHexColor('')).toThrow('not a hex colour: ');
});

test('channels come back as a lower-case six-digit colour', () => {
  expect(toHexColor({ red: 68, green: 1, blue: 84 })).toBe('#440154');
  expect(toHexColor({ red: 255, green: 255, blue: 255 })).toBe('#ffffff');
});

test('a channel out of range or off a grid is brought back into a colour', () => {
  expect(toHexColor({ red: 127.6, green: -20, blue: 300 })).toBe('#8000ff');
  expect(toHexColor({ red: Number.NaN, green: 0, blue: 0 })).toBe('#000000');
});
