import { expect, test } from 'vitest';

import type { DrawPicture } from '../pictures.ts';
import {
  isPictureSource,
  normalizeDegrees,
  normalizePicture,
  pictureContains,
  pictureCorners,
  updatePicture,
} from '../pictures.ts';

const picture: DrawPicture = {
  type: 'picture',
  id: 'i1',
  src: 'data:image/png;base64,AAAA',
  x: 10,
  y: 20,
  width: 40,
  height: 20,
};

test('a picture turned a quarter keeps its centre and swaps its extent', () => {
  const turned = { ...picture, rotation: 90 };
  const corners = pictureCorners(turned).map(({ x, y }) => ({
    x: Math.round(x),
    y: Math.round(y),
  }));

  expect(corners).toStrictEqual([
    { x: 40, y: 10 },
    { x: 40, y: 50 },
    { x: 20, y: 50 },
    { x: 20, y: 10 },
  ]);
  expect(pictureContains(turned, { x: 30, y: 45 })).toBe(true);
  expect(pictureContains(turned, { x: 12, y: 30 })).toBe(false);
});

test('only an image data URL every browser draws is a picture source', () => {
  expect(isPictureSource('data:image/svg+xml;base64,PHN2Zy8+')).toBe(true);
  expect(isPictureSource('https://example.org/a.png')).toBe(false);
  expect(isPictureSource('data:text/html,<p>')).toBe(false);
});

test('a picture changed is normalized, and the others stay as they were', () => {
  const drawing = { objects: [picture, { type: 'mark', id: 'm1' }] };
  const next = updatePicture(drawing, 'i1', { rotation: 270, still: true });

  expect(next.objects[0]).toStrictEqual({
    ...picture,
    rotation: -90,
    still: true,
  });
  expect(next.objects[1]).toBe(drawing.objects[1]);
  expect(normalizePicture({ ...picture, rotation: 720 })).toStrictEqual(
    picture,
  );
  expect(normalizeDegrees(-190)).toBe(170);
  expect(normalizeDegrees(180)).toBe(180);
});
