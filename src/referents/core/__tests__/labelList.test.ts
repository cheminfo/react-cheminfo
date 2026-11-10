import { expect, test } from 'vitest';

import { joinReferentLabels } from '../labelList.ts';

test('three numbers or more in a row are a range, fewer are listed', () => {
  expect(joinReferentLabels(['1', '2', '3', '4'])).toBe('1–4');
  expect(joinReferentLabels(['2', '3'])).toBe('2, 3');
  expect(joinReferentLabels(['5', '6', '7', '8', '10', '12', '13', '14'])).toBe(
    '5–8, 10, 12–14',
  );
});

test('the members of one compound follow its number once', () => {
  expect(joinReferentLabels(['5a', '5b', '5c', '5e'])).toBe('5a–c,e');
  expect(joinReferentLabels(['20a', '20b'])).toBe('20a,b');
  expect(joinReferentLabels(['3', '5a', '5b', '5c', '6b'])).toBe('3, 5a–c, 6b');
  // A compound and its members are not one run.
  expect(joinReferentLabels(['5', '5a', '5b'])).toBe('5, 5a,b');
});

test('the list is sorted, each compound once, and what is not a number last', () => {
  expect(joinReferentLabels(['4', '?', '2', '3', '2', '1'])).toBe('1–4, ?');
  expect(joinReferentLabels(['5e', '5b', '5a', '5c'])).toBe('5a–c,e');
  expect(joinReferentLabels(['10', '9', '11'])).toBe('9–11');
});

test('a prefix is kept, and letters run past z as a series letters them', () => {
  expect(joinReferentLabels(['S1', 'S2', 'S3', 'S5'])).toBe('S1–S3, S5');
  expect(joinReferentLabels(['7y', '7z', '7aa'])).toBe('7y–aa');
  expect(joinReferentLabels(['1'])).toBe('1');
  expect(joinReferentLabels([])).toBe('');
});
