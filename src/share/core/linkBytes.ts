/**
 * Bytes written into a link: in the URL-safe base64 alphabet, and deflated or
 * inflated through the browser's own streams.
 */

/**
 * Write bytes in the URL-safe base64 alphabet, without padding.
 * @param bytes - The bytes.
 * @returns The text.
 */
export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCodePoint(byte);
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/[=]+$/, '');
}

/**
 * Read bytes written by {@link toBase64Url}.
 * @param text - The text, without padding.
 * @returns The bytes, or `null` when the text is not URL-safe base64.
 */
export function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[\w-]*$/.test(text) || text.length % 4 === 1) return null;
  const base64 = text.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes;
}

/**
 * Pass bytes through a compression or a decompression stream.
 * @param bytes - The bytes in.
 * @param stream - The stream.
 * @param limit - The most the bytes out may weigh, so a link made by hand
 * cannot make the page inflate without end.
 * @default Infinity
 * @returns The bytes out.
 * @throws {Error} When the bytes out weigh more than `limit`, or the stream
 * cannot read the bytes in.
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
        controller.error(new Error('The value unpacks larger than allowed.'));
        return;
      }
      controller.enqueue(chunk);
    },
  });
}
