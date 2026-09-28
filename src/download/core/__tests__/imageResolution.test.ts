import { expect, test } from 'vitest';

import {
  DEFAULT_IMAGE_RESOLUTION,
  IMAGE_RESOLUTIONS,
  formatImageSize,
  imageResolution,
  imageSize,
} from '../imageResolution.ts';

test('the resolutions are the four the picker offers, in order', () => {
  expect(IMAGE_RESOLUTIONS.map((resolution) => resolution.id)).toStrictEqual([
    'screen',
    'retina',
    'print',
    'poster',
  ]);
  expect(IMAGE_RESOLUTIONS.map((resolution) => resolution.scale)).toStrictEqual(
    [1, 2, 4, 8],
  );
  expect(DEFAULT_IMAGE_RESOLUTION.id).toBe('retina');
});

test('a resolution is looked up by identity, and falls back to the default', () => {
  expect(imageResolution('print')).toStrictEqual({
    id: 'print',
    label: 'Print (4×)',
    scale: 4,
  });
  expect(imageResolution('half a metre')).toStrictEqual(
    DEFAULT_IMAGE_RESOLUTION,
  );
});

test('a picture comes out the drawing multiplied by the resolution', () => {
  expect(imageSize({ width: 360, height: 155 }, 4)).toStrictEqual({
    width: 1440,
    height: 620,
    scale: 4,
  });
});

test('a fractional size is rounded to whole pixels', () => {
  expect(imageSize({ width: 360.4, height: 154.6 }, 1)).toStrictEqual({
    width: 360,
    height: 155,
    scale: 1,
  });
});

test('a picture too wide to rasterize is brought down instead of blanked', () => {
  const size = imageSize({ width: 4000, height: 300 }, 8);

  expect(size).toStrictEqual({ width: 8192, height: 614, scale: 2.048 });
});

test('a picture holding too many pixels is brought down as well', () => {
  const size = imageSize({ width: 3000, height: 2000 }, 8);

  expect(size.width * size.height).toBeLessThanOrEqual(32 * 1024 * 1024);
  expect(size).toStrictEqual({
    width: 7094,
    height: 4729,
    scale: 2.3648267026007073,
  });
});

test('a resolution that is not a number is read as the size on screen', () => {
  expect(imageSize({ width: 200, height: 100 }, Number.NaN)).toStrictEqual({
    width: 200,
    height: 100,
    scale: 1,
  });
});

test('an empty drawing still comes out as one pixel rather than none', () => {
  expect(imageSize({ width: 0, height: 0 }, 2)).toStrictEqual({
    width: 2,
    height: 2,
    scale: 2,
  });
});

test('the size is written the way it is shown next to the resolution', () => {
  expect(formatImageSize({ width: 1440, height: 620, scale: 4 })).toBe(
    '1440 × 620 px',
  );
  expect(formatImageSize(null)).toBe('nothing to export');
});
