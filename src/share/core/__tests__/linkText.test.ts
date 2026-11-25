import { expect, test } from 'vitest';

import { TOO_LARGE_MESSAGE, pipeBytes, toBase64Url } from '../linkBytes.ts';
import { packLinkText, unpackLinkText } from '../linkText.ts';

const LIMITS = { maxTokenLength: 4000, maxBytes: 64 * 1024 };

test('a JSON text of 3 kB travels in a link and comes back whole', async () => {
  const steps = Array.from({ length: 40 }, (_, index) => ({
    id: `s${index + 1}`,
    op: 'filter.gaussian',
    params: { sigma: { value: index / 7, unit: 'nm' } },
  }));
  const text = JSON.stringify({ steps, name: 'Ag ∅ µm' });
  const token = await packLinkText(text);

  expect(text).toHaveLength(3745);
  expect(token).toMatch(/^[\w-]+$/u);
  await expect(unpackLinkText(token, LIMITS)).resolves.toBe(text);
});

test('a small token inflating past the cap carries nothing', async () => {
  const token = await packLinkText('0'.repeat(1024 * 1024));

  await expect(unpackLinkText(token, LIMITS)).resolves.toBeNull();
  await expect(
    unpackLinkText(token, { ...LIMITS, maxBytes: 1024 * 1024 }),
  ).resolves.toBe('0'.repeat(1024 * 1024));
});

test('a token too long, not base64url, not deflate-raw or not UTF-8 carries nothing', async () => {
  const notDeflate = toBase64Url(new TextEncoder().encode('plain text'));
  const notUtf8 = await pipeBytes(
    Uint8Array.of(0xc3, 0x28),
    new CompressionStream('deflate-raw'),
  );

  await expect(
    Promise.all([
      unpackLinkText('a'.repeat(4001), LIMITS),
      unpackLinkText('not base64url!', LIMITS),
      unpackLinkText(notDeflate, LIMITS),
      unpackLinkText(toBase64Url(notUtf8), LIMITS),
    ]),
  ).resolves.toStrictEqual([null, null, null, null]);
});

test('a capped pipe stops past its cap', async () => {
  const packed = await pipeBytes(
    new Uint8Array(4096),
    new CompressionStream('gzip'),
  );

  await expect(
    pipeBytes(packed, new DecompressionStream('gzip'), 4095),
  ).rejects.toThrow(TOO_LARGE_MESSAGE);

  const unpacked = await pipeBytes(packed, new DecompressionStream('gzip'));

  expect(unpacked).toStrictEqual(new Uint8Array(4096));
});
