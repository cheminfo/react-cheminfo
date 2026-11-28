import { expect, test } from 'vitest';

import { formatSi } from '../siPrefix.ts';
import { wrapWords } from '../words.ts';

test('a value takes the prefix that keeps it between 1 and 1000, to three figures', () => {
  expect(formatSi(0.00231, 'A')).toBe('2.31\u00A0mA');
  expect(formatSi(4700, 'Ω')).toBe('4.7\u00A0kΩ');
  expect(formatSi(1.1037, 'V')).toBe('1.1\u00A0V');
  expect(formatSi(2.5e-7, 'A')).toBe('250\u00A0nA');
  expect(formatSi(1e7, 'Ω')).toBe('10\u00A0MΩ');
});

test('a negative value takes a true minus, nothing and no number are written plainly', () => {
  expect(formatSi(-0.763, 'V')).toBe('\u2212763\u00A0mV');
  expect(formatSi(0, 'V')).toBe('0\u00A0V');
  expect(formatSi(Number.NaN, 'V')).toBe('–\u00A0V');
});

test('French writes a decimal comma, and a site may keep an ordinary space', () => {
  expect(formatSi(0.00231, 'A', { language: 'fr' })).toBe('2,31\u00A0mA');
  expect(formatSi(1.104, 'V', { language: 'fr' })).toBe('1,1\u00A0V');
  expect(formatSi(4.7e-9, 'F', { space: ' ' })).toBe('4.7 nF');
});

test('words are gathered into lines of at most a width', () => {
  expect(
    wrapWords('the circuit has no ground to measure from', 12),
  ).toStrictEqual(['the circuit', 'has no', 'ground to', 'measure from']);
  expect(wrapWords('electrochemistry', 5)).toStrictEqual(['electrochemistry']);
  expect(wrapWords('', 5)).toStrictEqual([]);
});
