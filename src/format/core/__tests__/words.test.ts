import { expect, test } from 'vitest';

import { pluralize } from '../words.ts';

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
