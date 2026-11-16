import { XSadd } from 'ml-xsadd';
import { expect, test } from 'vitest';

import { fromBase64Url, toBase64Url } from '../linkBytes.ts';
import {
  MAX_LINK_TOKEN,
  packLinkValue,
  packLinkValueIfFits,
  unpackLinkValue,
} from '../linkValue.ts';

const BENCH = {
  pieces: [
    { id: 'b1', kind: 'battery', x: 120, y: 200, values: { emf: 6 } },
    {
      id: 'r1',
      kind: 'resistor',
      x: 320,
      y: 200,
      values: { resistance: 1000 },
    },
  ],
  wires: [{ from: [120, 160], to: [320, 160] }],
};

test('a value comes back from its token as it went in', async () => {
  const token = await packLinkValue(BENCH);

  expect(token).toMatch(/^[\w-]+$/);
  await expect(unpackLinkValue(token)).resolves.toStrictEqual(BENCH);
});

test('a token too long for a link is not given', async () => {
  const { random } = new XSadd(12345);
  // Noise does not deflate, so this is well past what a link carries.
  const noise: number[] = [];
  for (let index = 0; index < 4000; index++) noise.push(random());

  await expect(packLinkValueIfFits({ noise })).resolves.toBeUndefined();

  const small = await packLinkValueIfFits(BENCH);

  expect(small).toBe(await packLinkValue(BENCH));
  expect(small?.length).toBeLessThan(MAX_LINK_TOKEN);
});

test('a token that is no packed value reads as nothing', async () => {
  await expect(unpackLinkValue('')).resolves.toBeUndefined();
  await expect(unpackLinkValue('not base64!')).resolves.toBeUndefined();
  await expect(unpackLinkValue('abcde')).resolves.toBeUndefined();

  // Valid base64url, but not deflated JSON.
  const plain = toBase64Url(new TextEncoder().encode('{"a":1}'));

  await expect(unpackLinkValue(plain)).resolves.toBeUndefined();
});

test('a token longer than any link is not even read', async () => {
  await expect(unpackLinkValue('A'.repeat(40_000))).resolves.toBeUndefined();
});

test('base64url round-trips every byte, without padding', () => {
  const bytes = new Uint8Array(256);
  for (let index = 0; index < bytes.length; index++) bytes[index] = index;
  const text = toBase64Url(bytes);

  expect(text).not.toMatch(/[+/=]/);
  expect(fromBase64Url(text)).toStrictEqual(bytes);
  expect(fromBase64Url('a+b')).toBeNull();
  expect(fromBase64Url('abcde')).toBeNull();
});
