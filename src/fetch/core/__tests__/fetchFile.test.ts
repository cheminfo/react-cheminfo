import { expect, test } from 'vitest';

import { fetchFile } from '../fetchBytes.ts';

test('a file comes with its bytes and the type its server gives it, or none', async () => {
  const typed = await fetchFile('https://example.org/cells.tif', {
    fetch: () =>
      Promise.resolve(
        new Response(new Uint8Array([73, 73, 42, 0]), {
          headers: { 'content-type': 'image/tiff' },
        }),
      ),
  });
  const untyped = await fetchFile('https://example.org/cells.raw', {
    fetch: () =>
      Promise.resolve(
        new Response(new Blob([new Uint8Array([1, 2])]), {
          headers: {},
        }),
      ),
  });

  expect([
    [...typed.bytes],
    typed.type,
    [...untyped.bytes],
    untyped.type,
  ]).toStrictEqual([[73, 73, 42, 0], 'image/tiff', [1, 2], '']);
});
