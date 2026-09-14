import { expect, test } from 'vitest';

import {
  bracketProblem,
  formulaProblem,
  isUsableLabel,
  problem,
} from '../problems.ts';

test('brackets closed in order raise nothing, and each way of getting them wrong is named', () => {
  expect(bracketProblem('(a + (b))')).toBeUndefined();
  expect(bracketProblem('a + b')).toBeUndefined();
  expect(bracketProblem('(a')).toBe('A bracket is left open.');
  expect(bracketProblem(')a(')).toBe('A closing bracket has nothing to close.');
});

test('a problem about a whole part carries no index key at all, and one about an entry carries its index', () => {
  const whole = problem(
    'error',
    { part: 'memory', where: 'Memory' },
    'The budget must be a number above zero.',
  );
  const entry = problem(
    'warning',
    { part: 'range', index: 0, where: 'Range 1' },
    'From is not below to.',
  );

  expect(whole).toStrictEqual({
    severity: 'error',
    part: 'memory',
    where: 'Memory',
    message: 'The budget must be a number above zero.',
  });
  expect(Object.hasOwn(whole, 'index')).toBe(false);
  expect(entry).toStrictEqual({
    severity: 'warning',
    part: 'range',
    index: 0,
    where: 'Range 1',
    message: 'From is not below to.',
  });
});

test('a label that can be a variable is accepted', () => {
  expect(isUsableLabel('amide')).toBe(true);
  expect(isUsableLabel('_private')).toBe(true);
  expect(isUsableLabel('$band')).toBe(true);
  expect(isUsableLabel('band2')).toBe(true);
});

test('a label a function cannot be given is refused', () => {
  expect(isUsableLabel('C=O stretch')).toBe(false);
  expect(isUsableLabel('2band')).toBe(false);
  expect(isUsableLabel('')).toBe(false);
  expect(isUsableLabel('amide-I')).toBe(false);
});

test('a reserved word is refused, because a function cannot take one as a parameter', () => {
  expect(isUsableLabel('class')).toBe(false);
  expect(isUsableLabel('return')).toBe(false);
  expect(isUsableLabel('new')).toBe(false);
});

test('an expression that reads its variable and closes its brackets passes', () => {
  expect(formulaProblem('log10(y)', 'y')).toBeUndefined();
  expect(formulaProblem('10000000/x', 'x')).toBeUndefined();
  expect(formulaProblem('-log10(y) * 2', 'y')).toBeUndefined();
});

test('an empty expression is named as empty rather than left to fail at filter time', () => {
  expect(formulaProblem('', 'y')).toBe('The expression is empty.');
  expect(formulaProblem(' '.repeat(3), 'y')).toBe('The expression is empty.');
});

test('an expression that never reads its variable would flatten every spectrum', () => {
  expect(formulaProblem('2 + 2', 'y')).toBe(
    'The expression never reads y, so every point would get the same value.',
  );
});

test('the variable is matched whole, so a name containing it does not count', () => {
  expect(formulaProblem('yield * 2', 'y')).toBe(
    'The expression never reads y, so every point would get the same value.',
  );
});

test('an unbalanced bracket is caught on the side it is unbalanced', () => {
  expect(formulaProblem('log10(y', 'y')).toBe('A bracket is left open.');
  expect(formulaProblem('log10(y))', 'y')).toBe(
    'A closing bracket has nothing to close.',
  );
});
