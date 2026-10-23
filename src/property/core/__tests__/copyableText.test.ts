import { expect, test } from 'vitest';

import { NOT_AVAILABLE, copyableText } from '../copyableText.ts';

test('a written value is copied as it reads', () => {
  expect(copyableText(' 180.16 ')).toBe('180.16');
  expect(copyableText(42)).toBe('42');
});

test('a missing value and a drawn one copy nothing', () => {
  expect(copyableText('')).toBeNull();
  expect(copyableText(NOT_AVAILABLE)).toBeNull();
  expect(copyableText(null)).toBeNull();
  expect(copyableText({ type: 'span' })).toBeNull();
});
