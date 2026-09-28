import { expect, test } from 'vitest';

import { filterNeedle, matchesNeedle } from '../textFilter.ts';

test('what was typed is read without its case or its spaces', () => {
  expect(filterNeedle('  GlcNAc ')).toBe('glcnac');
});

test('a box holding nothing but spaces filters nothing', () => {
  expect(filterNeedle(' '.repeat(3))).toBe('');
});

test('an empty filter keeps every entry', () => {
  expect(matchesNeedle('', 'Gal')).toBe(true);
  expect(matchesNeedle('')).toBe(true);
});

test('an entry matches on any of the things it is known by', () => {
  expect(matchesNeedle('nac', 'GlcNAc', 'N-acetylglucosamine')).toBe(true);
  expect(matchesNeedle('acetyl', 'GlcNAc', 'N-acetylglucosamine')).toBe(true);
});

test('an entry that carries the filter nowhere does not match', () => {
  expect(matchesNeedle('xyz', 'GlcNAc', 'N-acetylglucosamine')).toBe(false);
});

test('a match is made on a substring, not on a whole word', () => {
  expect(matchesNeedle('glc', 'GlcNAc')).toBe(true);
});

test('a field an entry has none of is skipped rather than matched', () => {
  expect(matchesNeedle('gal', undefined, 'Gal')).toBe(true);
  expect(matchesNeedle('gal', undefined)).toBe(false);
});
