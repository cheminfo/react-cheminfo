import { expect, test } from 'vitest';

import { errorMessage, toError } from '../toError.ts';

test('an error is handed back as the same object', () => {
  const error = new TypeError('no WebGL context');

  expect(toError(error)).toBe(error);
});

test('a thrown string becomes an error carrying it, an empty one is named', () => {
  expect(toError('parse failed').message).toBe('parse failed');
  expect(toError('').message).toBe('""');
});

test('the message of a thrown object is its JSON, never [object Object]', () => {
  expect(errorMessage({ status: 404, detail: 'gone' })).toBe(
    '{"status":404,"detail":"gone"}',
  );
  expect(errorMessage(new Error('the worker died'))).toBe('the worker died');
  expect(errorMessage(undefined)).toBe('undefined was thrown');
  expect(errorMessage(false)).toBe('false');
});
