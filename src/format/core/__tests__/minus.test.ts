import { expect, test } from 'vitest';

import { MINUS_SIGN, typesetMinus } from '../minus.ts';

test('a leading hyphen is typeset as a minus sign, and only it', () => {
  expect(MINUS_SIGN.codePointAt(0)).toBe(0x22_12);
  expect(typesetMinus('-1.25')).toBe('−1.25');
  expect(typesetMinus('3.5')).toBe('3.5');
  expect(typesetMinus('1e-5')).toBe('1e-5');
  expect(typesetMinus('')).toBe('');
});
