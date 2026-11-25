import { afterEach, expect, test, vi } from 'vitest';

import { digestHex } from '../digestHex.ts';
import { figureDigest } from '../figureState.ts';

const ABC = new TextEncoder().encode('abc');

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect x="1" y="2" width="30" height="10"/></svg>';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the digests of the standard test vector', async () => {
  await expect(digestHex('SHA-256', ABC)).resolves.toBe(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
  await expect(digestHex('SHA-1', ABC)).resolves.toBe(
    'a9993e364706816aba3e25717850c26c9cd0d89d',
  );
});

test('the bytes may come as an ArrayBuffer', async () => {
  await expect(
    digestHex('SHA-256', Uint8Array.from([97, 98, 99]).buffer),
  ).resolves.toBe(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('a figure is digested on what it draws, as it always was', async () => {
  await expect(figureDigest(FIGURE)).resolves.toBe(
    'f4b4d6344f8c344f1445ab452532fa9ee3fb67ff13db83aebd55f0bd2a7b50ef',
  );
});

test('a page offering no digests digests no figure', async () => {
  vi.stubGlobal('crypto', undefined);

  await expect(figureDigest(FIGURE)).resolves.toBeUndefined();
});

test('a view over shared memory, which Web Crypto does not read, is digested as its bytes', async () => {
  const shared = new Uint8Array(new SharedArrayBuffer(3));
  shared.set([1, 2, 3]);

  await expect(digestHex('SHA-1', shared)).resolves.toBe(
    await digestHex('SHA-1', Uint8Array.of(1, 2, 3)),
  );
  await expect(digestHex('SHA-1', Uint8Array.of(1, 2, 3))).resolves.toBe(
    '7037807198c22a7d2b0807371d763779a84fdfcf',
  );
});
