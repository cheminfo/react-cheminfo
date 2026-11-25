import { expect, test, vi } from 'vitest';

import {
  CancelledRequestError,
  RequestTimeoutError,
} from '../../../worker/core/errors.ts';
import { fireAndForget, isAbortError, isCancellation } from '../abort.ts';

test('an abort is known by its name, whatever made it', () => {
  const named = new Error('the picker was closed');
  named.name = 'AbortError';

  expect([
    isAbortError(new DOMException('aborted', 'AbortError')),
    isAbortError(AbortSignal.abort().reason),
    isAbortError(named),
    isAbortError({ name: 'AbortError' }),
    isAbortError(new DOMException('refused', 'NotAllowedError')),
    isAbortError(new TypeError('AbortError')),
    isAbortError('AbortError'),
    isAbortError(null),
  ]).toStrictEqual([true, true, true, true, false, false, false, false]);
});

test('a cancellation is an abort or a worker request nobody waits for', () => {
  expect([
    isCancellation(new CancelledRequestError('the slider moved on')),
    isCancellation(AbortSignal.abort().reason),
    isCancellation(new RequestTimeoutError('outlived its budget')),
    isCancellation(new Error('the worker failed')),
  ]).toStrictEqual([true, true, false, false]);
});

test('work nobody awaits ignores the cancellation it is expected to meet', async () => {
  const work = Promise.reject(new CancelledRequestError('terminated'));
  const handled = vi.spyOn(work, 'catch');

  fireAndForget(work);

  expect(handled).toHaveBeenCalledOnce();
  await expect(handled.mock.results[0]?.value).resolves.toBeUndefined();
});

test('work nobody awaits passes a refusal nobody expects on, never swallowed', async () => {
  const defect = new TypeError('the worker lost its cache');
  const work = Promise.reject(defect);
  const handled = vi.spyOn(work, 'catch');

  fireAndForget(work);

  await expect(handled.mock.results[0]?.value).rejects.toBe(defect);
});

test('the refusals a caller expects are its own to name', async () => {
  const full = new Error('the disk is full');
  const timedOut = new RequestTimeoutError('outlived its budget');
  const expectFull = (error: unknown) => error === full;
  const refused = Promise.reject(full);
  const other = Promise.reject(timedOut);
  const refusedHandled = vi.spyOn(refused, 'catch');
  const otherHandled = vi.spyOn(other, 'catch');

  fireAndForget(refused, expectFull);
  fireAndForget(other, expectFull);

  await expect(refusedHandled.mock.results[0]?.value).resolves.toBeUndefined();
  await expect(otherHandled.mock.results[0]?.value).rejects.toBe(timedOut);
});
