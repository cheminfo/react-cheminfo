/**
 * Bytes a browser API reads only outside shared memory — Web Crypto, a
 * `Blob` — taken as they are, or copied when they lie over a
 * `SharedArrayBuffer`.
 */

/**
 * The bytes as a view a browser API reads: the same view, or a copy of one
 * over shared memory.
 * @param bytes - The bytes.
 * @returns A view over an `ArrayBuffer`.
 */
export function unsharedBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return isUnshared(bytes) ? bytes : new Uint8Array(bytes);
}

function isUnshared(bytes: Uint8Array): bytes is Uint8Array<ArrayBuffer> {
  return bytes.buffer instanceof ArrayBuffer;
}
