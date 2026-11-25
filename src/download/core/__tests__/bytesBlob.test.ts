import { expect, test } from 'vitest';

import { bytesBlob } from '../bytesBlob.ts';

async function contentOf(
  blob: Blob,
): Promise<{ type: string; bytes: number[] }> {
  return {
    type: blob.type,
    bytes: [...new Uint8Array(await blob.arrayBuffer())],
  };
}

test('bytes become a blob of their media type, a view read where it starts', async () => {
  const file = new Uint8Array([0, 137, 80, 78, 71, 0]);

  await expect(
    Promise.all([
      contentOf(bytesBlob(file.subarray(1, 5), 'image/png')),
      contentOf(bytesBlob(new Uint8Array([1, 2]).buffer)),
    ]),
  ).resolves.toStrictEqual([
    { type: 'image/png', bytes: [137, 80, 78, 71] },
    { type: '', bytes: [1, 2] },
  ]);
});

test('the pieces of a stream make one blob, in order', async () => {
  const pieces = [new Uint8Array([1, 2]), new Uint8Array([3]).buffer];

  await expect(
    contentOf(bytesBlob(pieces, 'application/zip')),
  ).resolves.toStrictEqual({ type: 'application/zip', bytes: [1, 2, 3] });
});

test('a view over shared memory, which a blob holds none of, is read too', async () => {
  const shared = new Uint8Array(new SharedArrayBuffer(3));
  shared.set([7, 8, 9]);

  await expect(
    contentOf(bytesBlob(shared, 'image/tiff')),
  ).resolves.toStrictEqual({ type: 'image/tiff', bytes: [7, 8, 9] });
});
