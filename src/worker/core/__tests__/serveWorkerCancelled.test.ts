import { expect, test, vi } from 'vitest';

import { serveWorkerRequests } from '../serveWorkerRequests.ts';

import { FakeScope } from './fakeScope.ts';

test('a request cancelled while the worker was busy never runs; the request after it does', async () => {
  const scope = new FakeScope();
  const started: number[] = [];
  serveWorkerRequests(
    (value: number) => {
      started.push(value);
      return value * 2;
    },
    { scope },
  );

  // The three arrive together, as they do while a long job holds the worker.
  scope.send({ id: 1, request: 10 });
  scope.send({ id: 2, request: 20 });
  scope.send({ id: 1, cancel: true });

  await vi.waitFor(() => {
    expect(scope.posted).toHaveLength(2);
  });

  expect([started, scope.posted]).toStrictEqual([
    [20],
    [
      {
        id: 1,
        ok: false,
        message: 'request 1 was cancelled before it started',
      },
      { id: 2, ok: true, response: 40 },
    ],
  ]);
});
