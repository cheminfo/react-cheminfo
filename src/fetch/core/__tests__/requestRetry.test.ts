import { gunzipSync } from 'node:zlib';

import { expect, test } from 'vitest';

import {
  causeOf,
  gzipBody,
  isRetryableStatus,
  pause,
  retryAfter,
} from '../requestRetry.ts';

test('a refused connection says why', () => {
  // undici's own AggregateError carries no message of its own.
  const aggregate = new AggregateError(
    [new Error('connect ECONNREFUSED 127.0.0.1:11980')],
    'every address refused',
  );
  aggregate.message = '';
  const refused = new TypeError('fetch failed', { cause: aggregate });

  expect(causeOf(refused)).toBe(
    'fetch failed: connect ECONNREFUSED 127.0.0.1:11980',
  );
  expect(causeOf(new Error('plain'))).toBe('plain');
  expect(causeOf('a string')).toBe('a string');
});

test('a cause with no message is named by its errno code, then its name', () => {
  const coded = Object.assign(new Error('reset'), { code: 'ECONNRESET' });
  coded.message = '';
  const unnamed = new RangeError('unnamed');
  unnamed.message = '';

  expect(causeOf(new Error('fetch failed', { cause: coded }))).toBe(
    'fetch failed: ECONNRESET',
  );
  expect(causeOf(new Error('fetch failed', { cause: unnamed }))).toBe(
    'fetch failed: RangeError',
  );
});

test('a body is gzipped as HTTP reads it back', async () => {
  const text = JSON.stringify({
    molecules: [{ id: 'LTS0001', smiles: 'CCO' }],
    returnInfo: true,
  });
  const gzipped = await gzipBody(text);

  expect([gzipped[0], gzipped[1]]).toStrictEqual([0x1f, 0x8b]);
  expect(gunzipSync(gzipped).toString('utf8')).toBe(text);
});

test('the statuses worth asking again are no answer, throttling and 5xx', () => {
  expect(isRetryableStatus(0)).toBe(true);
  expect(isRetryableStatus(429)).toBe(true);
  expect(isRetryableStatus(500)).toBe(true);
  expect(isRetryableStatus(503)).toBe(true);
  expect(isRetryableStatus(400)).toBe(false);
  expect(isRetryableStatus(404)).toBe(false);
  expect(isRetryableStatus(200)).toBe(false);
});

test('Retry-After is read as seconds or as an HTTP date', () => {
  const now = Date.parse('2026-11-28T10:00:00Z');

  expect(retryAfter('12', now)).toBe(12_000);
  expect(retryAfter('Sat, 28 Nov 2026 10:00:30 GMT', now)).toBe(30_000);
  expect(retryAfter(null, now)).toBeUndefined();
  expect(retryAfter('  ', now)).toBeUndefined();
  expect(retryAfter('soon', now)).toBeUndefined();
});

test('a pause ends on time, and a signal stops it first', async () => {
  await expect(pause(1, undefined)).resolves.toBeUndefined();

  const controller = new AbortController();
  const waiting = pause(60_000, controller.signal);
  controller.abort(new Error('stopped'));

  await expect(waiting).rejects.toThrow('stopped');

  await expect(pause(1, controller.signal)).rejects.toThrow('stopped');
});
