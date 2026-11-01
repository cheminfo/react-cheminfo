import { expect, test } from 'vitest';

import { paintedBox } from '../paintedBox.ts';

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: readonly number[];
}

/**
 * A picture of one colour, with a block of another painted on it.
 * @param width - Width, in pixels.
 * @param height - Height, in pixels.
 * @param background - RGBA of the background.
 * @param block - Where the block lies, and its RGBA.
 * @returns The RGBA values, row by row.
 */
function picture(
  width: number,
  height: number,
  background: readonly number[],
  block?: Block,
): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inside =
        block !== undefined &&
        x >= block.x &&
        x < block.x + block.width &&
        y >= block.y &&
        y < block.y + block.height;
      pixels.set(inside ? block.color : background, (y * width + x) * 4);
    }
  }
  return pixels;
}

const WHITE = [255, 255, 255, 255];
const CLEAR = [0, 0, 0, 0];
const BLUE = [0, 114, 178, 255];

test('a molecule on a white pane keeps its own box and a thin margin', () => {
  const pixels = picture(200, 100, WHITE, {
    x: 60,
    y: 20,
    width: 50,
    height: 40,
    color: BLUE,
  });

  // The margin is 2% of the longest side painted: one pixel here.
  expect(paintedBox(pixels, 200, 100)).toStrictEqual({
    x: 59,
    y: 19,
    width: 52,
    height: 42,
  });
});

test('a transparent background is told by its alpha alone', () => {
  const pixels = picture(400, 300, CLEAR, {
    x: 100,
    y: 50,
    width: 200,
    height: 100,
    color: [255, 255, 255, 40],
  });

  expect(paintedBox(pixels, 400, 300)).toStrictEqual({
    x: 96,
    y: 46,
    width: 208,
    height: 108,
  });
});

test('shading too faint to see is background', () => {
  const pixels = picture(50, 50, WHITE, {
    x: 10,
    y: 10,
    width: 5,
    height: 5,
    color: [250, 250, 250, 255],
  });

  expect(paintedBox(pixels, 50, 50)).toBeNull();
});

test('the margin stops at the edge of the picture', () => {
  const pixels = picture(100, 100, WHITE, {
    x: 0,
    y: 30,
    width: 100,
    height: 10,
    color: BLUE,
  });

  expect(paintedBox(pixels, 100, 100)).toStrictEqual({
    x: 0,
    y: 28,
    width: 100,
    height: 14,
  });
});

test('a picture that is only background, or that has none, is kept whole', () => {
  expect(paintedBox(picture(40, 30, BLUE), 40, 30)).toBeNull();

  const corner = picture(40, 30, WHITE, {
    x: 0,
    y: 0,
    width: 5,
    height: 5,
    color: BLUE,
  });

  expect(paintedBox(corner, 40, 30)).toBeNull();
  expect(paintedBox(new Uint8ClampedArray(0), 0, 0)).toBeNull();
});
