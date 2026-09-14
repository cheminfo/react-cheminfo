import { expect, test } from 'vitest';

import { joinClassNames } from '../joinClassNames.ts';

test('names that apply are joined in order, with single spaces', () => {
  expect(joinClassNames('code-block', 'code-block--dark', 'site-code')).toBe(
    'code-block code-block--dark site-code',
  );
});

test('a name that does not apply leaves no stray space', () => {
  expect(joinClassNames('slideshow', undefined)).toBe('slideshow');
  expect(joinClassNames('wordmark', '')).toBe('wordmark');
  expect(joinClassNames(false, 'no-print', null, 'extra')).toBe(
    'no-print extra',
  );
  expect(joinClassNames()).toBe('');
});
