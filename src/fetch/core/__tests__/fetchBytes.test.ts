import { expect, test } from 'vitest';

import { ApiError } from '../apiError.ts';
import type { BytesProgress } from '../fetchBytes.ts';
import { TransferError, fetchBytes } from '../fetchBytes.ts';

function chunked(
  chunks: readonly number[][],
  options: { breakAfter?: number } = {},
): ReadableStream<Uint8Array<ArrayBuffer>> {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (options.breakAfter === index) {
        controller.error(new TypeError('network changed'));
        return;
      }
      const chunk = chunks[index];
      index += 1;
      if (chunk === undefined) controller.close();
      else controller.enqueue(new Uint8Array(chunk));
    },
  });
}

function serving(response: Response | Error): typeof globalThis.fetch {
  return () =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response);
}

test('the bytes arrive whole, with their progress, into a buffer of the expected size', async () => {
  const seen: BytesProgress[] = [];
  const bytes = await fetchBytes('weights.onnx', {
    expectedBytes: 5,
    onProgress: (progress) => seen.push(progress),
    fetch: serving(new Response(chunked([[1, 2], [3], [4, 5]]))),
  });

  expect([...bytes]).toStrictEqual([1, 2, 3, 4, 5]);
  expect(bytes.buffer.byteLength).toBe(5);
  expect(seen).toStrictEqual([
    { received: 2, total: 5 },
    { received: 3, total: 5 },
    { received: 5, total: 5 },
  ]);
});

test('without a size, the chunks are joined, and the declared length is the total', async () => {
  const seen: BytesProgress[] = [];
  const bytes = await fetchBytes('database.sqlite', {
    onProgress: (progress) => seen.push(progress),
    fetch: serving(
      new Response(chunked([[7], [8, 9]]), {
        headers: { 'content-length': '3' },
      }),
    ),
  });

  expect([...bytes]).toStrictEqual([7, 8, 9]);
  expect(seen).toStrictEqual([
    { received: 1, total: 3 },
    { received: 3, total: 3 },
  ]);
});

test('a body longer than expected is refused at the chunk that overflows', async () => {
  const download = fetchBytes('weights.onnx', {
    expectedBytes: 2,
    fetch: serving(new Response(chunked([[1], [2, 3], [4]]))),
  });

  await expect(download).rejects.toBeInstanceOf(TransferError);
  await expect(download).rejects.toMatchObject({
    problem: 'size',
    received: 3,
    expected: 2,
    message: 'the file has more bytes than the 2 expected',
  });
});

test('a body shorter than expected is refused once it ends', async () => {
  const download = fetchBytes('weights.onnx', {
    expectedBytes: 4,
    fetch: serving(new Response(chunked([[1, 2]]))),
  });

  await expect(download).rejects.toMatchObject({
    name: 'TransferError',
    problem: 'size',
    received: 2,
    expected: 4,
    message: 'the file has fewer bytes than the 4 expected',
  });
});

test('a body that breaks off is an interrupted transfer, its cause kept', async () => {
  const download = fetchBytes('weights.onnx', {
    fetch: serving(new Response(chunked([[1], [2]], { breakAfter: 1 }))),
  });

  await expect(download).rejects.toBeInstanceOf(TransferError);
  await expect(download).rejects.toMatchObject({
    problem: 'interrupted',
    received: 1,
    expected: null,
    cause: new TypeError('network changed'),
  });
});

test('a server out of reach is status 0, and a refusal carries its status', async () => {
  const unreachable = fetchBytes('weights.onnx', {
    fetch: serving(new TypeError('Failed to fetch')),
  });
  const refused = fetchBytes('weights.onnx', {
    fetch: serving(new Response('gone', { status: 404 })),
  });

  await expect(unreachable).rejects.toBeInstanceOf(ApiError);
  await expect(unreachable).rejects.toMatchObject({
    status: 0,
    message: 'the server could not be reached',
  });
  await expect(refused).rejects.toBeInstanceOf(ApiError);
  await expect(refused).rejects.toMatchObject({ status: 404 });
});

test('an abort is passed on untouched', async () => {
  const controller = new AbortController();
  const reason = new DOMException('stopped', 'AbortError');
  controller.abort(reason);

  await expect(
    fetchBytes('weights.onnx', {
      signal: controller.signal,
      fetch: () => Promise.reject(reason),
    }),
  ).rejects.toBe(reason);
});
