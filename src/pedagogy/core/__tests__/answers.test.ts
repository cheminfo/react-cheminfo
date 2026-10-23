import { expect, test } from 'vitest';

import {
  emptyCase,
  formatSigned,
  readAnswerNumber,
  unreadableCase,
} from '../answers.ts';

test('a number is read the way a student types it', () => {
  expect(
    ['42', '+5', '−3', '-3', '1,5', '75.8 %', ' 12 ', '.5', '1 000', '–2'].map(
      (text) => readAnswerNumber(text),
    ),
  ).toStrictEqual([42, 5, -3, -3, 1.5, 75.8, 12, 0.5, 1000, -2]);
  expect(
    ['', 'abc', '1.2.3', '--1', '1e999'].map((text) => readAnswerNumber(text)),
  ).toStrictEqual([undefined, undefined, undefined, undefined, undefined]);
});

test('a whole number rejects a decimal', () => {
  expect(readAnswerNumber('7', true)).toBe(7);
  expect(readAnswerNumber('−7', true)).toBe(-7);
  expect(readAnswerNumber('7.5', true)).toBeUndefined();
});

test('a signed number is written with its sign and a true minus', () => {
  expect([5, -2, 0].map(formatSigned)).toStrictEqual(['+5', '−2', '0']);
});

test('an empty box is told what to type', () => {
  expect(emptyCase('Electrons', 'a number of electrons')).toStrictEqual({
    label: 'Electrons',
    passed: false,
    reason: 'Type a number of electrons.',
    actual: null,
  });
});

test('what does not read as the value asked for is quoted back', () => {
  expect(
    unreadableCase('Electrons', ' twelve ', 'a whole number'),
  ).toStrictEqual({
    label: 'Electrons',
    passed: false,
    reason: '“twelve” is not a whole number.',
    actual: ' twelve ',
  });
});
