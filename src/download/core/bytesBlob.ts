import { unsharedBytes } from './unshared.ts';

/** Bytes a blob is made of: a view, or a whole buffer. */
export type BlobBytes = Uint8Array | ArrayBuffer;

/**
 * Some bytes as a `Blob`: a file kept, downloaded or handed to a decoder that
 * reads a blob. The bytes may come in one piece or in several (the chunks of
 * a stream); a view over shared memory is copied, since a `Blob` holds none.
 * @param bytes - The bytes, or their pieces in order.
 * @param type - Their media type: `image/png`.
 * @default type '' — none, as a `Blob` has by default
 * @returns The blob.
 */
export function bytesBlob(
  bytes: BlobBytes | readonly BlobBytes[],
  type = '',
): Blob {
  const pieces: readonly BlobBytes[] = Array.isArray(bytes) ? bytes : [bytes];
  const parts: BlobPart[] = [];
  for (const piece of pieces) {
    parts.push(piece instanceof ArrayBuffer ? piece : unsharedBytes(piece));
  }
  return new Blob(parts, { type });
}
