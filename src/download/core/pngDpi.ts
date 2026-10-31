/**
 * The resolution a PNG states, in its `pHYs` chunk.
 *
 * A browser writes none, and a word processor or a slide then places the
 * picture as if it were 72 or 96 dpi — a figure painted for print arrives
 * several times too large. Stated, it arrives at the size it was drawn.
 */

import CRC32 from 'crc-32';

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Metres in an inch: `pHYs` counts pixels per metre. */
const METRES_PER_INCH = 0.0254;

/**
 * A PNG stating a resolution, any resolution it stated before dropped.
 * @param png - The PNG file's bytes.
 * @param dpi - Dots per inch.
 * @returns A new PNG file.
 * @throws {Error} When the bytes are not a PNG.
 */
export function withPngDpi(
  png: Uint8Array,
  dpi: number,
): Uint8Array<ArrayBuffer> {
  for (let index = 0; index < SIGNATURE.length; index++) {
    if (png[index] !== SIGNATURE[index]) throw new Error('Not a PNG file.');
  }
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunks: Uint8Array[] = [png.subarray(0, SIGNATURE.length)];
  let offset = SIGNATURE.length;
  while (offset + 8 <= png.length) {
    const end = offset + 12 + view.getUint32(offset);
    const type = chunkType(png, offset);
    if (type !== 'pHYs') chunks.push(png.subarray(offset, end));
    if (type === 'IHDR') chunks.push(physChunk(dpi));
    offset = end;
  }
  let total = 0;
  for (const chunk of chunks) total += chunk.length;
  const result = new Uint8Array(total);
  let position = 0;
  for (const chunk of chunks) {
    result.set(chunk, position);
    position += chunk.length;
  }
  return result;
}

/**
 * The resolution a PNG states.
 * @param png - The PNG file's bytes.
 * @returns Whole dots per inch, or `undefined` when it states none.
 */
export function pngDpi(png: Uint8Array): number | undefined {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  let offset = SIGNATURE.length;
  while (offset + 8 <= png.length) {
    if (chunkType(png, offset) === 'pHYs' && png[offset + 16] === 1) {
      return Math.round(view.getUint32(offset + 8) * METRES_PER_INCH);
    }
    offset += 12 + view.getUint32(offset);
  }
  return undefined;
}

function chunkType(png: Uint8Array, offset: number): string {
  return String.fromCodePoint(...png.subarray(offset + 4, offset + 8));
}

function physChunk(dpi: number): Uint8Array {
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4);
  const perMetre = Math.round(dpi / METRES_PER_INCH);
  view.setUint32(8, perMetre);
  view.setUint32(12, perMetre);
  // The unit: 1 is the metre, 0 an aspect ratio with no size.
  chunk[16] = 1;
  view.setInt32(17, CRC32.buf(chunk.subarray(4, 17)));
  return chunk;
}
