import { expect, test } from 'vitest';

import { untilAborted } from '../untilAborted.ts';

test('without a signal the promise itself is handed back', () => {
  const promise = Promise.resolve(3);

  expect(untilAborted(promise)).toBe(promise);
});

test('a wait ends with the answer, or with the signal’s reason', async () => {
  await expect(
    untilAborted(Promise.resolve('benzene'), new AbortController().signal),
  ).resolves.toBe('benzene');

  const controller = new AbortController();
  const waiting = untilAborted(
    new Promise<never>(neverSettles),
    controller.signal,
  );
  controller.abort(new Error('the question moved on'));

  await expect(waiting).rejects.toThrow('the question moved on');
});

test('a signal aborted already, or with no reason, rejects as an AbortError', async () => {
  const controller = new AbortController();
  controller.abort('no error');

  await expect(
    untilAborted(Promise.resolve(1), controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' });
});

test('a failure of the promise is passed on as an error', async () => {
  await expect(
    untilAborted(
      Promise.reject(new Error('the server refused')),
      new AbortController().signal,
    ),
  ).rejects.toThrow('the server refused');
});

function neverSettles(): void {
  // The wait is ended by the signal alone.
}
