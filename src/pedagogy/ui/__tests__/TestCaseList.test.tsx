import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { failedValidation, finishValidation } from '../../core/validation.ts';
import { TestCaseList } from '../TestCaseList.tsx';

const CASES = [
  { passed: true, reason: 'matched "cats"', actual: 'cats' },
  {
    passed: false,
    reason: 'match was "cat", expected "cats"',
    actual: 'cat',
  },
];

test('every case is a row, and a failing one says why', () => {
  const html = renderToStaticMarkup(
    <TestCaseList results={finishValidation(CASES).cases} />,
  );

  expect(html.split('<li').length - 1).toBe(2);
  expect(html).toContain('matched &quot;cats&quot;');
  expect(html).toContain(
    'match was &quot;cat&quot;, expected &quot;cats&quot;',
  );
  expect(html).toContain('bp6-icon-tick-circle');
  expect(html).toContain('bp6-icon-cross-circle');
  expect(html).toContain('bp6-intent-danger');
});

test('an answer that never ran leaves its cases neutral, not red', () => {
  const result = failedValidation('Nothing to grade yet', CASES);
  const html = renderToStaticMarkup(
    <TestCaseList results={result.cases} pending />,
  );

  expect(html).toContain('bp6-icon-circle');
  expect(html).not.toContain('bp6-icon-cross-circle');
  expect(html).not.toContain('bp6-intent-danger');
});

test('a tool that names its cases puts the name in front of the sentence', () => {
  const html = renderToStaticMarkup(
    <TestCaseList
      results={CASES}
      label={(_result, position) => `Case ${position + 1}`}
    />,
  );

  expect(html).toContain('<strong style="margin-right:6px">Case 1</strong>');
  expect(html).toContain('Case 2');
});

test('a case with no sentence shows only its verdict', () => {
  const html = renderToStaticMarkup(
    <TestCaseList results={[{ passed: true, reason: '', actual: null }]} />,
  );

  expect(html).toContain('bp6-icon-tick-circle');
  expect(html).not.toContain('<span style="display:block');
});

test('an empty list renders nothing at all', () => {
  expect(renderToStaticMarkup(<TestCaseList results={[]} />)).toBe('');
});
