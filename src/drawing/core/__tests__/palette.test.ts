/**
 * The colours a drawing carries: the Okabe–Ito palette, and any colour split
 * into the hex and the opacity SVG writes, and joined back.
 */

import { expect, test } from 'vitest';

import { PALETTE, isColor, joinColor, splitColor } from '../palette.ts';

test('the palette is the eight of Okabe and Ito, black first', () => {
  expect(PALETTE.map((color) => color.value)).toStrictEqual([
    '#000000',
    '#e69f00',
    '#56b4e9',
    '#009e73',
    '#f0e442',
    '#0072b2',
    '#d55e00',
    '#cc79a7',
  ]);
  expect(PALETTE[0]?.name).toBe('Black');
});

test('a colour is six or eight hex digits after a hash', () => {
  expect(isColor('#0072b2')).toBe(true);
  expect(isColor('#0072B2cc')).toBe(true);
  expect(isColor('#07b')).toBe(false);
  expect(isColor('#0072b2c')).toBe(false);
  expect(isColor('0072b2')).toBe(false);
  expect(isColor('red')).toBe(false);
  expect(isColor(0x0072b2)).toBe(false);
});

test('a colour splits into a lowercase hex and an opacity to a hundredth', () => {
  expect(splitColor('#E69F00')).toStrictEqual({ hex: '#e69f00', opacity: 1 });
  expect(splitColor('#e69f0080')).toStrictEqual({
    hex: '#e69f00',
    opacity: 0.5,
  });
  expect(splitColor('#e69f0000')).toStrictEqual({ hex: '#e69f00', opacity: 0 });
  expect(splitColor('#e69f00ff')).toStrictEqual({ hex: '#e69f00', opacity: 1 });
});

test('a colour joined is opaque at full opacity, and carries its alpha below it', () => {
  expect(joinColor('#FF0000', 1)).toBe('#ff0000');
  expect(joinColor('#ff0000aa', 1.5)).toBe('#ff0000');
  expect(joinColor('#FF0000', 0.5)).toBe('#ff000080');
  expect(joinColor('#123456', 0.02)).toBe('#12345605');
  expect(joinColor('#123456', -1)).toBe('#12345600');
  expect(splitColor(joinColor('#0072b2', 0.25))).toStrictEqual({
    hex: '#0072b2',
    opacity: 0.25,
  });
});
