import { expect, test } from 'vitest';

import { fromBase64Url, toBase64Url } from '../linkBytes.ts';

test('bytes are written in the url alphabet, without padding', () => {
  expect(toBase64Url(new Uint8Array([251, 255]))).toBe('-_8');
  expect(fromBase64Url('-_8')).toStrictEqual(new Uint8Array([251, 255]));
});

test('text that is not base64url reads as null', () => {
  expect(fromBase64Url('a')).toBeNull();
  expect(fromBase64Url('a+b')).toBeNull();
});

test('a megabyte of every byte value reads back as written', () => {
  const bytes = new Uint8Array(1 << 20);
  for (let index = 0; index < bytes.length; index++) bytes[index] = index % 256;
  const text = toBase64Url(bytes);

  expect([text.length, /^[\w-]+$/.test(text)]).toStrictEqual([1_398_102, true]);
  expect(fromBase64Url(text)).toStrictEqual(bytes);
});
