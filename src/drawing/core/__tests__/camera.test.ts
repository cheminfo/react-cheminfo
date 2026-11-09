import { expect, test } from 'vitest';

import {
  PIXELS_PER_POINT,
  fillCamera,
  frameCamera,
  visibleBox,
  zoomAround,
  zoomOfShare,
  zoomShare,
} from '../camera.ts';

test('100 % shows a point at its printed size, 4/3 of a CSS pixel', () => {
  expect(zoomOfShare(1)).toBe(PIXELS_PER_POINT);
  expect(zoomShare(PIXELS_PER_POINT)).toBe(1);
  expect(zoomShare(2.5)).toBe(1.875);
});

test('a zoom is kept between 25 % and 1600 %', () => {
  expect(zoomShare(zoomOfShare(0.1))).toBe(0.25);
  expect(zoomShare(zoomOfShare(20))).toBe(16);

  const camera = { x: 0, y: 0, zoom: zoomOfShare(16) };

  expect(zoomAround(camera, 2, { x: 0, y: 0 }).zoom).toBe(zoomOfShare(16));
});

test('zooming keeps the point under the offset where it was', () => {
  const camera = { x: 10, y: 20, zoom: 2 };
  const offset = { x: 100, y: -50 };
  const zoomed = zoomAround(camera, 1.5, offset);

  expect(zoomed.zoom).toBe(3);
  // The drawing point under the offset: 10 + 100 / 2, 20 - 50 / 2.
  expect(zoomed.x + offset.x / zoomed.zoom).toBeCloseTo(60, 12);
  expect(zoomed.y + offset.y / zoomed.zoom).toBeCloseTo(-5, 12);
});

test('a framed drawing is centred, with a margin, and never closer than 225 %', () => {
  const wide = { x: 0, y: 0, width: 400, height: 100 };

  expect(frameCamera(wide, 896, 600)).toStrictEqual({ x: 200, y: 50, zoom: 2 });

  const small = { x: 0, y: 0, width: 10, height: 10 };

  expect(frameCamera(small, 896, 600)).toStrictEqual({ x: 5, y: 5, zoom: 3 });

  const atom = { x: 7, y: 8, width: 0, height: 0 };

  expect(frameCamera(atom, 896, 600)).toStrictEqual({ x: 7, y: 8, zoom: 2.5 });
});

test('a page filling the view leaves no margin, however close that takes it', () => {
  const page = { x: 100, y: 200, width: 400, height: 800 };

  expect(fillCamera(page, 1000, 400)).toStrictEqual({
    x: 300,
    y: 600,
    zoom: 0.5,
  });
  expect(fillCamera(page, 400, 4000)).toStrictEqual({
    x: 300,
    y: 600,
    zoom: 1,
  });
  // Past where a framed drawing stops, so a small page fills it too.
  expect(frameCamera(page, 40_000, 80_000).zoom).toBe(3);
  expect(fillCamera(page, 4000, 8000).zoom).toBe(10);
});

test('the box a camera shows is the size of the view, about its point', () => {
  expect(visibleBox({ x: 10, y: 20, zoom: 2 }, 100, 40)).toStrictEqual({
    x: -15,
    y: 10,
    width: 50,
    height: 20,
  });
});
