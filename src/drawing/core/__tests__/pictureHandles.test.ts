import { expect, test } from 'vitest';

import {
  dragPictureHandle,
  pictureHandleAt,
  pictureHandleCursor,
  pictureHandles,
} from '../pictureHandles.ts';
import type { DrawPicture } from '../pictures.ts';
import { centredPicture, pictureCorners } from '../pictures.ts';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';

// A 40 × 20 picture centred on the origin.
function picture(rotation?: number): DrawPicture {
  const placed = centredPicture('i1', PNG, 40, 20);
  return rotation === undefined ? placed : { ...placed, rotation };
}

function rounded(points: ReadonlyArray<{ x: number; y: number }>) {
  return points.map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }));
}

test('the turning handle stands above the top edge, the same height on screen at any zoom', () => {
  const [rotate, nw] = pictureHandles(picture(), 0.5);

  expect(rotate).toStrictEqual({ handle: 'rotate', point: { x: 0, y: -22 } });
  expect(nw).toStrictEqual({ handle: 'nw', point: { x: -20, y: -10 } });
  expect(pictureHandleAt(picture(), { x: 1, y: -21 }, 0.5)).toBe('rotate');
  expect(pictureHandleAt(picture(), { x: 19, y: 9 }, 0.5)).toBe('se');
  expect(pictureHandleAt(picture(), { x: 0, y: 0 }, 0.5)).toBeUndefined();
});

test('a corner resizes the picture in proportion, the corner across staying put', () => {
  const resized = dragPictureHandle(picture(), 'se', { x: 60, y: 10 }, false);

  // The pointer is projected on the diagonal: 1.8 times as large.
  expect(resized).toMatchObject({ x: -20, y: -10, width: 72, height: 36 });
});

test('Shift frees the proportions of a corner', () => {
  const resized = dragPictureHandle(picture(), 'se', { x: 60, y: 10 }, true);

  expect(resized).toMatchObject({ x: -20, y: -10, width: 80, height: 20 });
});

test('an edge stretches the picture along one side only', () => {
  const resized = dragPictureHandle(picture(), 'w', { x: -50, y: 7 }, false);

  expect(resized).toMatchObject({ x: -50, y: -10, width: 70, height: 20 });
});

test('a turned picture resizes along its own sides', () => {
  const turned = picture(90);
  const fixed = rounded(pictureCorners(turned))[0];
  // Turned a quarter clockwise, the east edge faces down the screen.
  const resized = dragPictureHandle(turned, 'e', { x: 3, y: 50 }, false);

  expect(resized.width).toBe(70);
  expect(resized.height).toBe(20);
  expect(resized.rotation).toBe(90);
  expect(rounded(pictureCorners(resized))[0]).toStrictEqual(fixed);
});

test('a picture is never resized below four points, nor turned inside out', () => {
  const resized = dragPictureHandle(picture(), 'e', { x: -80, y: 0 }, false);

  expect(resized).toMatchObject({ x: -20, width: 4, height: 20 });
});

test('the turning handle turns by 15° steps, or freely with Shift', () => {
  const pointer = { x: 20, y: -32 };

  expect(dragPictureHandle(picture(), 'rotate', pointer, false).rotation).toBe(
    30,
  );
  expect(dragPictureHandle(picture(), 'rotate', pointer, true).rotation).toBe(
    32.01,
  );

  const level = dragPictureHandle(
    picture(30),
    'rotate',
    { x: 0, y: -40 },
    false,
  );

  expect(level.rotation).toBeUndefined();
});

test('the pointer over a handle shows which way it resizes, turned with the picture', () => {
  expect(pictureHandleCursor('e')).toBe('ew-resize');
  expect(pictureHandleCursor('ne')).toBe('nesw-resize');
  expect(pictureHandleCursor('se')).toBe('nwse-resize');
  expect(pictureHandleCursor('e', 90)).toBe('ns-resize');
  expect(pictureHandleCursor('n', 45)).toBe('nesw-resize');
  expect(pictureHandleCursor('rotate')).toBe('grab');
});

test('a picture is placed whole, centred on the origin, to the hundredth of a point', () => {
  expect(centredPicture('i3', PNG, 40.004, 21)).toStrictEqual({
    type: 'picture',
    id: 'i3',
    src: PNG,
    x: -20,
    y: -10.5,
    width: 40,
    height: 21,
  });
});
