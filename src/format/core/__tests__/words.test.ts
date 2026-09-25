import { expect, test } from 'vitest';

import { ordinal, pluralize } from '../words.ts';

test('only a count of exactly one takes the singular', () => {
  expect(pluralize(1, 'structure')).toBe('structure');
  expect(pluralize(0, 'structure')).toBe('structures');
  expect(pluralize(2, 'structure')).toBe('structures');
  expect(pluralize(-1, 'structure')).toBe('structures');
});

test('an irregular plural is spelled out rather than derived', () => {
  expect(pluralize(1, 'match', 'matches')).toBe('match');
  expect(pluralize(3, 'match', 'matches')).toBe('matches');
  expect(pluralize(2, 'analysis', 'analyses')).toBe('analyses');
});

test('the first three positions take their own suffix', () => {
  expect(ordinal(1)).toBe('1st');
  expect(ordinal(2)).toBe('2nd');
  expect(ordinal(3)).toBe('3rd');
  expect(ordinal(4)).toBe('4th');
});

test('the teens take th however they end', () => {
  expect(ordinal(11)).toBe('11th');
  expect(ordinal(12)).toBe('12th');
  expect(ordinal(13)).toBe('13th');
  expect(ordinal(111)).toBe('111th');
  expect(ordinal(112)).toBe('112th');
});

test('the suffix follows the last digit past the teens', () => {
  expect(ordinal(21)).toBe('21st');
  expect(ordinal(22)).toBe('22nd');
  expect(ordinal(23)).toBe('23rd');
  expect(ordinal(101)).toBe('101st');
  expect(ordinal(1000)).toBe('1000th');
});
