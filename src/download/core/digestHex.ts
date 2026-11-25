import { uint8ArrayToHex } from 'uint8array-extras';

import { unsharedBytes } from './unshared.ts';

/**
 * The digest of some bytes, written in lowercase hexadecimal — what a file's
 * identity, an `ETag` or a figure's fingerprint is compared by.
 *
 * It is the browser's own Web Crypto, which Node shares, so it works in a page,
 * in a worker and on a server alike. A page served over plain HTTP has no
 * `crypto.subtle`; a caller that may run there checks for it first.
 * @param algorithm - The digest to take.
 * @param bytes - What to digest.
 * @returns The digest, two hexadecimal digits per byte: 40 for SHA-1, 64 for
 * SHA-256.
 */
export async function digestHex(
  algorithm: 'SHA-1' | 'SHA-256',
  bytes: Uint8Array | ArrayBuffer,
): Promise<string> {
  const source = bytes instanceof ArrayBuffer ? bytes : unsharedBytes(bytes);
  const digest = await crypto.subtle.digest(algorithm, source);
  return uint8ArrayToHex(new Uint8Array(digest));
}
