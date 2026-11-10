/**
 * The checks a value read from a file goes through before it is trusted.
 */

import { expect, test } from 'vitest';

import { arrayOf, isFiniteNumber, isRecord } from '../values.ts';

function parsePoint(value: unknown): { x: number } | undefined {
  return isRecord(value) && isFiniteNumber(value.x)
    ? { x: value.x }
    : undefined;
}

test('an array keeps the items that parse and drops the others', () => {
  expect(
    arrayOf([{ x: 1 }, { x: '2' }, null, { x: 3, y: 4 }], parsePoint),
  ).toStrictEqual([{ x: 1 }, { x: 3 }]);
  expect(arrayOf({ x: 1 }, parsePoint)).toStrictEqual([]);
  expect(arrayOf(undefined, parsePoint)).toStrictEqual([]);
});

test('an item that parses to zero, an empty string or false is kept', () => {
  expect(
    arrayOf([0, 1, 'x'], (item) =>
      typeof item === 'number' ? item : undefined,
    ),
  ).toStrictEqual([0, 1]);
  expect(
    arrayOf(['', 'a', 3], (item) =>
      typeof item === 'string' ? item : undefined,
    ),
  ).toStrictEqual(['', 'a']);
  expect(
    arrayOf([false, true, 0], (item) =>
      typeof item === 'boolean' ? item : undefined,
    ),
  ).toStrictEqual([false, true]);
});

test('a record is a plain object, never null or an array', () => {
  expect(isRecord({})).toBe(true);
  expect(isRecord({ a: 1 })).toBe(true);
  expect(isRecord(null)).toBe(false);
  expect(isRecord([])).toBe(false);
  expect(isRecord('text')).toBe(false);
});

test('a finite number is neither infinite, nor NaN, nor a numeric string', () => {
  expect(isFiniteNumber(0)).toBe(true);
  expect(isFiniteNumber(-2.5)).toBe(true);
  expect(isFiniteNumber(Infinity)).toBe(false);
  expect(isFiniteNumber(Number.NaN)).toBe(false);
  expect(isFiniteNumber('3')).toBe(false);
});
