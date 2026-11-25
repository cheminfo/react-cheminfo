/**
 * Bytes written into a link: in the URL-safe base64 alphabet, and deflated or
 * inflated through the browser's own streams.
 */

import { base64ToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras';

/** What {@link pipeBytes} throws once the bytes out weigh more than allowed. */
export const TOO_LARGE_MESSAGE = 'The value unpacks larger than allowed.';

/**
 * Write bytes in the URL-safe base64 alphabet, without padding.
 * @param bytes - The bytes.
 * @returns The text.
 */
export function toBase64Url(bytes: Uint8Array): string {
  return uint8ArrayToBase64(bytes, { urlSafe: true });
}

/**
 * Read bytes written by {@link toBase64Url}.
 * @param text - The text, without padding.
 * @returns The bytes, or `null` when the text is not URL-safe base64, or its
 * length leaves a single character over, which no number of bytes is written
 * as.
 */
export function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[\w-]*$/.test(text) || text.length % 4 === 1) return null;
  return base64ToUint8Array(text);
}

/**
 * Pass bytes through a compression or a decompression stream.
 * @param bytes - The bytes in.
 * @param stream - The stream.
 * @param limit - The most the bytes out may weigh, so a link made by hand
 * cannot make the page inflate without end.
 * @default Infinity
 * @returns The bytes out.
 * @throws {RangeError} {@link TOO_LARGE_MESSAGE} as soon as the bytes out
 * weigh more than `limit`; whatever the stream throws when it cannot read the
 * bytes in.
 */
export async function pipeBytes(
  bytes: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream,
  limit = Infinity,
): Promise<Uint8Array<ArrayBuffer>> {
  // A stream of its own, not a Blob's: jsdom's Blob has no `stream()`.
  const source = new ReadableStream<Uint8Array<ArrayBuffer>>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  const output = source.pipeThrough(stream).pipeThrough(capped(limit));
  return new Uint8Array(await new Response(output).arrayBuffer());
}

function capped(limit: number): TransformStream<Uint8Array, Uint8Array> {
  let length = 0;
  return new TransformStream({
    transform(chunk, controller) {
      length += chunk.byteLength;
      if (length > limit) {
        controller.error(new RangeError(TOO_LARGE_MESSAGE));
        return;
      }
      controller.enqueue(chunk);
    },
  });
}
