import { expect, test, vi } from 'vitest';

import { handOver } from '../handOver.ts';
import { serveWorkerRequests } from '../serveWorkerRequests.ts';

import { FakeScope } from './fakeScope.ts';

test('the transfer hook is handed the request its answer answers', async () => {
  const scope = new FakeScope();
  const seen: Array<[string, string]> = [];
  serveWorkerRequests(
    (request: { kind: 'grid' | 'label'; size: number }) =>
      request.kind === 'grid' ? new ArrayBuffer(request.size) : 'no buffer',
    {
      scope,
      transfer: (response, request) => {
        seen.push([request.kind, typeof response]);
        return response instanceof ArrayBuffer ? [response] : [];
      },
    },
  );

  scope.send({ id: 1, request: { kind: 'grid', size: 8 } });
  scope.send({ id: 2, request: { kind: 'label', size: 0 } });

  await vi.waitFor(() => {
    expect(scope.posted).toHaveLength(2);
  });

  expect(seen).toStrictEqual([
    ['grid', 'object'],
    ['label', 'string'],
  ]);
  expect(scope.transfers.map((transfer) => transfer?.length)).toStrictEqual([
    1, 0,
  ]);
});

test('a handler handing its answer over with its buffers posts the answer alone, with them', async () => {
  const scope = new FakeScope();
  const grid = new ArrayBuffer(8);
  const asked: Array<{ grid: ArrayBuffer } | string> = [];
  serveWorkerRequests<'grid' | 'label', { grid: ArrayBuffer } | string>(
    (kind) => (kind === 'grid' ? handOver({ grid }, [grid]) : 'no buffer'),
    {
      scope,
      transfer: (response) => {
        asked.push(response);
        return [];
      },
    },
  );

  scope.send({ id: 1, request: 'grid' });
  scope.send({ id: 2, request: 'label' });

  await vi.waitFor(() => {
    expect(scope.posted).toHaveLength(2);
  });

  expect(scope.posted).toStrictEqual([
    { id: 1, ok: true, response: { grid } },
    { id: 2, ok: true, response: 'no buffer' },
  ]);
  expect(scope.transfers).toStrictEqual([[grid], []]);
  expect(asked).toStrictEqual(['no buffer']);
});
