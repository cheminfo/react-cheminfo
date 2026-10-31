import { expect, test } from 'vitest';

import { pngDpi, withPngDpi } from '../pngDpi.ts';

/** A 1×1 transparent PNG, as browsers write them: no resolution chunk. */
const PIXEL = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  ),
  (character) => character.codePointAt(0) ?? 0,
);

/**
 * The type of every chunk, in order.
 * @param png - The PNG file's bytes.
 * @returns The four-letter types.
 */
function chunkTypes(png: Uint8Array): string[] {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const types: string[] = [];
  let offset = 8;
  while (offset + 8 <= png.length) {
    types.push(String.fromCodePoint(...png.subarray(offset + 4, offset + 8)));
    offset += 12 + view.getUint32(offset);
  }
  return types;
}

test('the resolution goes right after the header, and reads back', () => {
  expect(pngDpi(PIXEL)).toBeUndefined();

  const png = withPngDpi(PIXEL, 600);

  expect(chunkTypes(png)).toStrictEqual(['IHDR', 'pHYs', 'IDAT', 'IEND']);
  expect(pngDpi(png)).toBe(600);
});

test('a second resolution replaces the first rather than adding to it', () => {
  const again = withPngDpi(withPngDpi(PIXEL, 150), 1200);

  expect(chunkTypes(again)).toStrictEqual(['IHDR', 'pHYs', 'IDAT', 'IEND']);
  expect(pngDpi(again)).toBe(1200);
});

test('the chunk carries the checksum a reader verifies', () => {
  const png = withPngDpi(PIXEL, 300);

  // 300 dpi is 11811 pixels per metre, in both directions, the unit a metre.
  expect([...png.subarray(33, 54)]).toStrictEqual([
    0, 0, 0, 9, 0x70, 0x48, 0x59, 0x73, 0, 0, 0x2e, 0x23, 0, 0, 0x2e, 0x23, 1,
    0x78, 0xa5, 0x3f, 0x76,
  ]);
});

test('anything that is not a PNG is refused', () => {
  expect(() => withPngDpi(new Uint8Array(16), 300)).toThrow('Not a PNG file.');
});
