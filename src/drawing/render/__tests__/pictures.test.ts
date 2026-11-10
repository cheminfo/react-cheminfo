/**
 * A picture as it is drawn: an image in its turned frame.
 */

import { expect, test } from 'vitest';

import type { DrawPicture } from '../../core/pictures.ts';
import { imageCorners, imageTransform, picturePrimitive } from '../pictures.ts';

const picture: DrawPicture = {
  type: 'picture',
  id: 'i1',
  src: 'data:image/png;base64,AAAA',
  x: 10,
  y: 20,
  width: 40,
  height: 20,
};

test('a picture is drawn as an image, upright unless it is turned', () => {
  expect(picturePrimitive(picture)).toStrictEqual({
    kind: 'image',
    href: 'data:image/png;base64,AAAA',
    x: 10,
    y: 20,
    width: 40,
    height: 20,
    rotation: 0,
  });
  expect(
    picturePrimitive({ ...picture, rotation: 30, still: true }),
  ).toStrictEqual({
    kind: 'image',
    href: 'data:image/png;base64,AAAA',
    x: 10,
    y: 20,
    width: 40,
    height: 20,
    rotation: 30,
    still: true,
  });
});

test('an image turns about the centre of its box', () => {
  const upright = picturePrimitive(picture);

  expect(imageTransform(upright)).toBeUndefined();
  expect(imageTransform({ ...upright, rotation: 12.345 })).toBe(
    'rotate(12.35 30 30)',
  );
  expect(imageCorners(upright)).toStrictEqual([
    { x: 10, y: 20 },
    { x: 50, y: 20 },
    { x: 50, y: 40 },
    { x: 10, y: 40 },
  ]);

  const corners = imageCorners({ ...upright, rotation: 90 }).map(
    ({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }),
  );

  expect(corners).toStrictEqual([
    { x: 40, y: 10 },
    { x: 40, y: 50 },
    { x: 20, y: 50 },
    { x: 20, y: 10 },
  ]);
});
