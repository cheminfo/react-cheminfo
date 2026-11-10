/**
 * Text laid out from Adobe's core font metrics rather than measured, so a
 * drawing is the same file wherever it is made.
 */

import { expect, test } from 'vitest';

import {
  advanceOf,
  capHeight,
  isRoundGlyph,
  metricsOf,
  textWidth,
} from '../metrics.ts';

test('a character advances by its Helvetica width, 556 when unknown', () => {
  expect(advanceOf(' ')).toBe(278);
  expect(advanceOf('A')).toBe(667);
  expect(advanceOf('~')).toBe(584);
  expect(advanceOf('−')).toBe(584);
  expect(advanceOf('°')).toBe(400);
  expect(advanceOf('\u007F')).toBe(556);
  expect(advanceOf('α')).toBe(556);
  expect(advanceOf('')).toBe(556);
});

test('a capital stands 718 thousandths of an em high', () => {
  expect(capHeight(10)).toBeCloseTo(7.18, 10);
  expect(capHeight(14.4)).toBeCloseTo(10.3392, 10);
});

test('a font family is laid out with the metrics of its first name', () => {
  expect(metricsOf("'Times New Roman', Times, serif")).toBe('times');
  expect(metricsOf('"Courier New", Courier, monospace')).toBe('courier');
  expect(metricsOf('Arial, Helvetica, sans-serif')).toBe('helvetica');
  expect(metricsOf('Helvetica, Times')).toBe('helvetica');
  expect(metricsOf('')).toBe('helvetica');
});

test('a width is the sum of the advances of its font and weight', () => {
  expect(textWidth('Mg', 10)).toBe(13.89);
  expect(textWidth('Mg', 10, true)).toBe(14.44);
  expect(textWidth('Mg', 10, false, 'times')).toBe(13.89);
  expect(textWidth('Mg', 10, true, 'times')).toBe(14.44);
  expect(textWidth('Mg', 10, false, 'courier')).toBe(12);
  expect(textWidth('', 10)).toBe(0);
});

test('past ASCII, Times is a tenth narrower and bold keeps the regular width', () => {
  expect(textWidth('°', 10, false, 'times')).toBe(3.6);
  expect(textWidth('°', 10, true, 'times')).toBe(3.6);
  expect(textWidth('°', 10, true)).toBe(4);
  expect(textWidth('°C', 10, false, 'courier')).toBe(12);
});

test('a bond stops along a curve only at a round glyph', () => {
  expect(isRoundGlyph('O')).toBe(true);
  expect(isRoundGlyph('8')).toBe(true);
  expect(isRoundGlyph('s')).toBe(true);
  expect(isRoundGlyph('N')).toBe(false);
  expect(isRoundGlyph('H')).toBe(false);
});
