import { expect, test } from 'vitest';

import { pollUntil } from '../poll.ts';

test('the first value an attempt gives is handed back, without waiting', async () => {
  let attempts = 0;

  const value = await pollUntil(
    async () => {
      attempts++;
      return 'ready';
    },
    5000,
    'never',
  );

  expect(value).toBe('ready');
  expect(attempts).toBe(1);
});

test('an attempt giving nothing, or throwing, is tried again', async () => {
  let attempts = 0;
  const started = Date.now();

  const value = await pollUntil(
    async () => {
      attempts++;
      if (attempts === 1) return undefined;
      if (attempts === 2) throw new Error('not yet');
      return attempts;
    },
    5000,
    'never',
  );

  expect(value).toBe(3);
  // 100 ms, then 250 ms: the schedule expect.poll keeps.
  expect(Date.now() - started).toBeGreaterThanOrEqual(340);
});

test('a timeout of zero tries once, and says why it gave up', async () => {
  let attempts = 0;

  await expect(
    pollUntil(
      async () => {
        attempts++;
        throw new Error('answered 503');
      },
      0,
      'the tool did not answer',
    ),
  ).rejects.toThrow('the tool did not answer: answered 503');
  expect(attempts).toBe(1);
});

test('an attempt that gives nothing until the deadline fails with the message', async () => {
  await expect(
    pollUntil(async () => undefined, 150, 'no answer to the request g1'),
  ).rejects.toThrow(/^no answer to the request g1$/);
});
