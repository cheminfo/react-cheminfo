import { expect, test } from 'vitest';

import type { TestCaseResult } from '../validation.ts';
import { failedValidation, finishValidation } from '../validation.ts';

const PASSED: TestCaseResult = { passed: true, reason: 'ok', actual: 'cats' };
const FAILED: TestCaseResult = {
  passed: false,
  reason: 'match was "cat", expected "cats"',
  actual: 'cat',
};

test('an answer every case agrees with is right', () => {
  expect(finishValidation([PASSED, PASSED])).toStrictEqual({
    passed: true,
    error: null,
    cases: [PASSED, PASSED],
    missingOptions: [],
  });
});

test('one failing case is enough to be wrong', () => {
  const result = finishValidation([PASSED, FAILED, PASSED]);

  expect(result.passed).toBe(false);
  expect(result.error).toBeNull();
  expect(result.cases[1]?.reason).toBe('match was "cat", expected "cats"');
});

test('a missing option is wrong even when every case passes', () => {
  expect(finishValidation([PASSED], { missingOptions: ['g'] })).toStrictEqual({
    passed: false,
    error: null,
    cases: [PASSED],
    missingOptions: ['g'],
  });
});

test('an error is wrong even when every case passes', () => {
  expect(
    finishValidation([PASSED], { error: 'Unmatched ( in the pattern' }),
  ).toStrictEqual({
    passed: false,
    error: 'Unmatched ( in the pattern',
    cases: [PASSED],
    missingOptions: [],
  });
});

test('an explicitly absent error reads as no error', () => {
  expect(finishValidation([PASSED], { error: null }).passed).toBe(true);
  expect(finishValidation([PASSED], { missingOptions: [] }).passed).toBe(true);
});

test('an exercise with no cases has nothing failing in it', () => {
  expect(finishValidation([])).toStrictEqual({
    passed: true,
    error: null,
    cases: [],
    missingOptions: [],
  });
});

test('an answer that never ran carries the message and no cases', () => {
  expect(failedValidation('Write a pattern before checking.')).toStrictEqual({
    passed: false,
    error: 'Write a pattern before checking.',
    cases: [],
    missingOptions: [],
  });
});

test('an answer that never ran may still list its cases as unevaluated', () => {
  const unevaluated: TestCaseResult = {
    passed: false,
    reason: 'not evaluated',
    actual: null,
  };

  expect(
    failedValidation('Unmatched ( in the pattern', [unevaluated]),
  ).toStrictEqual({
    passed: false,
    error: 'Unmatched ( in the pattern',
    cases: [unevaluated],
    missingOptions: [],
  });
});

test('a tool may carry its own detail on each case', () => {
  interface MatchCaseResult extends TestCaseResult {
    kind: 'match';
    text: string;
  }
  const cases: MatchCaseResult[] = [
    { ...FAILED, kind: 'match', text: 'the cats sat' },
  ];
  const result = finishValidation(cases, { missingOptions: ['g', 'i'] });

  expect(result.passed).toBe(false);
  expect(result.missingOptions).toStrictEqual(['g', 'i']);
  expect(result.cases[0]?.text).toBe('the cats sat');
});
