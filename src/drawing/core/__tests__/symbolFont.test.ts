import { expect, test } from 'vitest';

import {
  hasLatinLetter,
  latinToGreek,
  symbolFontToUnicode,
} from '../symbolFont.ts';

test('a run in the Symbol font reads as the characters it shows', () => {
  expect(symbolFontToUnicode('abgdDW')).toBe('αβγδΔΩ');
  // Greek letters, not the micro and ohm signs Symbol also stands for.
  expect(symbolFontToUnicode('mW')).toBe('\u03BC\u03A9');
  // Its signs and arrows, as the bytes ChemDraw writes them.
  expect(symbolFontToUnicode('® ° ± ´ -')).toBe('→ ° ± × −');
  // The pieces of a tall bracket, in standard code points.
  expect(symbolFontToUnicode('æçè')).toBe('⎛⎜⎝');
  // Windows' Symbol font, 0xF000 higher.
  expect(symbolFontToUnicode('\uF061\uF0AE')).toBe('α→');
  // What Symbol does not draw stays as it is.
  expect(symbolFontToUnicode('12 α')).toBe('12 α');
});

test('Latin letters are made Greek as the Symbol font sets them', () => {
  expect(latinToGreek('b-Lactam 2')).toBe('β-Λαχταμ 2');
  expect(latinToGreek('qfj')).toBe('θφϕ');
  expect(latinToGreek('12 °C ±')).toBe('12 °\u03A7 ±');
});

test('a text with a Latin letter is told from one without', () => {
  expect(hasLatinLetter('12 °C')).toBe(true);
  expect(hasLatinLetter('α 12 →')).toBe(false);
  expect(hasLatinLetter('')).toBe(false);
});
